-- Update submit_flag to block banned users
CREATE OR REPLACE FUNCTION public.submit_flag(_challenge_id uuid, _submitted_flag text)
RETURNS jsonb
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
  _max_attempts int := 10;
  _window_minutes int := 5;
  _challenge_title text;
  _is_banned boolean;
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not authenticated');
  END IF;

  -- Check if user is banned
  SELECT is_banned INTO _is_banned
  FROM profiles WHERE user_id = _user_id;
  
  IF _is_banned = true THEN
    PERFORM log_audit_event('BANNED_USER_ATTEMPT', _user_id, NULL, _challenge_id,
      jsonb_build_object('action', 'flag_submission'));
    RETURN jsonb_build_object('success', false, 'message', 'Your account has been suspended. Contact an administrator.');
  END IF;

  -- Get challenge info
  SELECT points, title INTO _points, _challenge_title 
  FROM challenges WHERE id = _challenge_id AND is_active = true;
  
  IF _points IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Challenge not found or inactive');
  END IF;

  -- Check if already solved
  SELECT EXISTS (
    SELECT 1 FROM submissions 
    WHERE user_id = _user_id AND challenge_id = _challenge_id AND is_correct = true
  ) INTO _already_solved;

  IF _already_solved THEN
    RETURN jsonb_build_object('success', false, 'message', 'Challenge already solved');
  END IF;

  -- Rate limiting
  SELECT * INTO _rate_limit
  FROM submission_rate_limits
  WHERE user_id = _user_id AND challenge_id = _challenge_id
  FOR UPDATE;

  IF _rate_limit IS NOT NULL THEN
    IF _rate_limit.window_start + interval '1 minute' * _window_minutes < now() THEN
      UPDATE submission_rate_limits SET attempt_count = 1, window_start = now()
      WHERE user_id = _user_id AND challenge_id = _challenge_id;
    ELSIF _rate_limit.attempt_count >= _max_attempts THEN
      -- Log rate limit hit
      PERFORM log_audit_event('RATE_LIMIT_HIT', _user_id, NULL, _challenge_id, 
        jsonb_build_object('attempts', _rate_limit.attempt_count));
      RETURN jsonb_build_object(
        'success', false, 'message', 'Too many attempts. Please wait 5 minutes.',
        'rate_limited', true,
        'retry_after', EXTRACT(EPOCH FROM (_rate_limit.window_start + interval '1 minute' * _window_minutes - now()))::int
      );
    ELSE
      UPDATE submission_rate_limits SET attempt_count = attempt_count + 1
      WHERE user_id = _user_id AND challenge_id = _challenge_id;
    END IF;
  ELSE
    INSERT INTO submission_rate_limits (user_id, challenge_id, attempt_count, window_start)
    VALUES (_user_id, _challenge_id, 1, now());
  END IF;

  -- Validate flag
  SELECT validate_challenge_flag(_challenge_id, _submitted_flag) INTO _is_correct;

  -- Check for first blood
  IF _is_correct THEN
    SELECT NOT EXISTS (
      SELECT 1 FROM submissions WHERE challenge_id = _challenge_id AND is_correct = true
    ) INTO _is_first_blood;
  END IF;

  -- Insert submission (trigger handles points)
  INSERT INTO submissions (user_id, challenge_id, submitted_flag, is_correct, points_awarded, is_first_blood)
  VALUES (_user_id, _challenge_id, _submitted_flag, _is_correct, CASE WHEN _is_correct THEN _points ELSE 0 END, _is_first_blood);

  -- Log the submission
  PERFORM log_audit_event(
    CASE WHEN _is_correct THEN 'FLAG_CORRECT' ELSE 'FLAG_INCORRECT' END,
    _user_id, NULL, _challenge_id,
    jsonb_build_object(
      'challenge_title', _challenge_title,
      'points_awarded', CASE WHEN _is_correct THEN _points ELSE 0 END,
      'first_blood', _is_first_blood
    )
  );

  IF _is_correct THEN
    RETURN jsonb_build_object(
      'success', true, 'correct', true, 'points', _points,
      'first_blood', _is_first_blood,
      'message', CASE WHEN _is_first_blood THEN 'FIRST BLOOD!' ELSE 'Correct!' END
    );
  ELSE
    RETURN jsonb_build_object('success', true, 'correct', false, 'message', 'Incorrect flag');
  END IF;
END;
$$;

-- Create table for tracking user sessions/logins with IP and geo data
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  ip_address inet,
  country_code text,
  country_name text,
  city text,
  latitude numeric,
  longitude numeric,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON public.user_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_ip ON public.user_sessions(ip_address);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Only admins can view sessions
CREATE POLICY "Admins can view all sessions"
ON public.user_sessions FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Function to log user session with geolocation
CREATE OR REPLACE FUNCTION public.log_user_session(
  _ip_address text,
  _country_code text DEFAULT NULL,
  _country_name text DEFAULT NULL,
  _city text DEFAULT NULL,
  _latitude numeric DEFAULT NULL,
  _longitude numeric DEFAULT NULL,
  _user_agent text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not authenticated');
  END IF;

  INSERT INTO user_sessions (user_id, ip_address, country_code, country_name, city, latitude, longitude, user_agent)
  VALUES (_user_id, _ip_address::inet, _country_code, _country_name, _city, _latitude, _longitude, _user_agent);

  RETURN jsonb_build_object('success', true);
END;
$$;