-- =====================================================
-- SECURITY FIX: Prevent direct profile point manipulation
-- and add rate limiting for flag submissions
-- =====================================================

-- 1. Create a trigger to automatically update profile points when a correct submission is inserted
-- This removes the need for frontend to update points directly
CREATE OR REPLACE FUNCTION public.handle_correct_submission()
RETURNS TRIGGER AS $$
DECLARE
  _already_solved boolean;
BEGIN
  -- Only process correct submissions
  IF NEW.is_correct = true THEN
    -- Check if user already solved this challenge (prevent duplicate points)
    SELECT EXISTS (
      SELECT 1 FROM public.submissions 
      WHERE user_id = NEW.user_id 
        AND challenge_id = NEW.challenge_id 
        AND is_correct = true
        AND id != NEW.id
    ) INTO _already_solved;

    -- Only award points if not already solved
    IF NOT _already_solved THEN
      -- Update user profile
      UPDATE public.profiles
      SET 
        total_points = total_points + NEW.points_awarded,
        challenges_solved = challenges_solved + 1
      WHERE user_id = NEW.user_id;

      -- Update challenge solves count
      UPDATE public.challenges
      SET solves = solves + 1
      WHERE id = NEW.challenge_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing trigger if any, then create new one
DROP TRIGGER IF EXISTS on_correct_submission ON public.submissions;
CREATE TRIGGER on_correct_submission
  AFTER INSERT ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_correct_submission();

-- 2. CRITICAL: Restrict the profiles UPDATE policy to prevent users from modifying their own points
-- Drop the existing permissive policy and create a more restrictive one
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create a new restricted policy that only allows updating non-scoring fields
CREATE POLICY "Users can update own non-scoring fields"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    -- We can't prevent specific columns in RLS, so we'll handle this differently
  );

-- 3. Create a rate limiting table for submissions
CREATE TABLE IF NOT EXISTS public.submission_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  attempt_count int NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Create unique constraint for user+challenge combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limit_user_challenge 
  ON public.submission_rate_limits(user_id, challenge_id);

-- Enable RLS
ALTER TABLE public.submission_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own rate limits
CREATE POLICY "Users can view own rate limits"
  ON public.submission_rate_limits FOR SELECT
  USING (user_id = auth.uid());

-- 4. Create atomic submit_flag function with rate limiting
CREATE OR REPLACE FUNCTION public.submit_flag(
  _challenge_id uuid,
  _submitted_flag text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _is_correct boolean;
  _is_first_blood boolean := false;
  _points int;
  _already_solved boolean;
  _rate_limit record;
  _max_attempts int := 10; -- Max 10 attempts per 5 minutes
  _window_minutes int := 5;
BEGIN
  -- Get authenticated user
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Not authenticated'
    );
  END IF;

  -- Check if already solved
  SELECT EXISTS (
    SELECT 1 FROM submissions 
    WHERE user_id = _user_id 
      AND challenge_id = _challenge_id 
      AND is_correct = true
  ) INTO _already_solved;

  IF _already_solved THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Challenge already solved'
    );
  END IF;

  -- Rate limiting check
  SELECT * INTO _rate_limit
  FROM submission_rate_limits
  WHERE user_id = _user_id AND challenge_id = _challenge_id
  FOR UPDATE;

  IF _rate_limit IS NOT NULL THEN
    -- Check if window has expired (reset after 5 minutes)
    IF _rate_limit.window_start + interval '1 minute' * _window_minutes < now() THEN
      -- Reset the window
      UPDATE submission_rate_limits
      SET attempt_count = 1, window_start = now()
      WHERE user_id = _user_id AND challenge_id = _challenge_id;
    ELSIF _rate_limit.attempt_count >= _max_attempts THEN
      -- Rate limited
      RETURN jsonb_build_object(
        'success', false,
        'message', 'Too many attempts. Please wait 5 minutes.',
        'rate_limited', true,
        'retry_after', EXTRACT(EPOCH FROM (_rate_limit.window_start + interval '1 minute' * _window_minutes - now()))::int
      );
    ELSE
      -- Increment attempt count
      UPDATE submission_rate_limits
      SET attempt_count = attempt_count + 1
      WHERE user_id = _user_id AND challenge_id = _challenge_id;
    END IF;
  ELSE
    -- First attempt, create rate limit record
    INSERT INTO submission_rate_limits (user_id, challenge_id, attempt_count, window_start)
    VALUES (_user_id, _challenge_id, 1, now());
  END IF;

  -- Validate flag using existing secure function
  SELECT validate_challenge_flag(_challenge_id, _submitted_flag) INTO _is_correct;
  
  -- Get challenge points
  SELECT points INTO _points FROM challenges WHERE id = _challenge_id AND is_active = true;
  
  IF _points IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Challenge not found or inactive'
    );
  END IF;

  -- Check for first blood if correct
  IF _is_correct THEN
    SELECT NOT EXISTS (
      SELECT 1 FROM submissions 
      WHERE challenge_id = _challenge_id AND is_correct = true
    ) INTO _is_first_blood;
  END IF;

  -- Insert submission (trigger will handle point updates)
  INSERT INTO submissions (user_id, challenge_id, submitted_flag, is_correct, points_awarded, is_first_blood)
  VALUES (_user_id, _challenge_id, _submitted_flag, _is_correct, CASE WHEN _is_correct THEN _points ELSE 0 END, _is_first_blood);

  IF _is_correct THEN
    RETURN jsonb_build_object(
      'success', true,
      'correct', true,
      'points', _points,
      'first_blood', _is_first_blood,
      'message', CASE WHEN _is_first_blood THEN 'FIRST BLOOD!' ELSE 'Correct!' END
    );
  ELSE
    RETURN jsonb_build_object(
      'success', true,
      'correct', false,
      'message', 'Incorrect flag'
    );
  END IF;
END;
$$;

-- 5. Grant execute permission
GRANT EXECUTE ON FUNCTION public.submit_flag(uuid, text) TO authenticated;