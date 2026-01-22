-- =====================================================
-- SECURITY FIX: Add trigger to prevent direct modification of scoring columns
-- =====================================================

-- Create a trigger function to block direct updates to scoring columns
CREATE OR REPLACE FUNCTION public.prevent_score_manipulation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow changes to scoring fields if called by SECURITY DEFINER functions
  -- Check if the update is trying to change scoring columns
  IF (OLD.total_points IS DISTINCT FROM NEW.total_points) OR 
     (OLD.challenges_solved IS DISTINCT FROM NEW.challenges_solved) OR
     (OLD.rank IS DISTINCT FROM NEW.rank) THEN
    -- Check if this is being called from a trusted context (SECURITY DEFINER function)
    -- We use session variable to allow our trusted functions to update
    IF current_setting('app.bypass_score_protection', true) IS DISTINCT FROM 'true' THEN
      -- Not from trusted function - revert the scoring fields to old values
      NEW.total_points := OLD.total_points;
      NEW.challenges_solved := OLD.challenges_solved;
      NEW.rank := OLD.rank;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger (runs BEFORE update)
DROP TRIGGER IF EXISTS prevent_score_manipulation ON public.profiles;
CREATE TRIGGER prevent_score_manipulation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_score_manipulation();

-- Update handle_correct_submission to set the bypass flag
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
      -- Set bypass flag for this transaction
      PERFORM set_config('app.bypass_score_protection', 'true', true);
      
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
      
      -- Reset bypass flag
      PERFORM set_config('app.bypass_score_protection', 'false', true);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Also update unlock_hint to set the bypass flag
CREATE OR REPLACE FUNCTION public.unlock_hint(
  _user_id uuid,
  _challenge_id uuid,
  _hint_index int,
  _cost int
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_points int;
BEGIN
  -- Lock user row and get points
  SELECT total_points INTO _user_points
  FROM profiles
  WHERE user_id = _user_id
  FOR UPDATE;

  -- Check if user exists
  IF _user_points IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'User not found'
    );
  END IF;

  -- Check sufficient points
  IF _user_points < _cost THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Insufficient points'
    );
  END IF;

  -- Try to insert hint unlock (will fail if duplicate due to UNIQUE)
  BEGIN
    INSERT INTO hint_unlocks (user_id, challenge_id, hint_index, points_spent)
    VALUES (_user_id, _challenge_id, _hint_index, _cost);
  EXCEPTION
    WHEN unique_violation THEN
      RETURN jsonb_build_object(
        'success', false,
        'message', 'Hint already unlocked'
      );
  END;

  -- Set bypass flag for this transaction
  PERFORM set_config('app.bypass_score_protection', 'true', true);

  -- Deduct points only if insert succeeded
  UPDATE profiles
  SET total_points = total_points - _cost
  WHERE user_id = _user_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Hint unlocked',
    'cost', _cost
  );
END;
$$;