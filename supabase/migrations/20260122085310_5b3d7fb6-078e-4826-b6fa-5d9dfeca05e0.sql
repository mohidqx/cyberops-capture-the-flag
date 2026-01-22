-- =====================================================
-- AUDIT LOGGING: Track flag submissions and score changes
-- =====================================================

-- Create audit log table
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid,
  target_user_id uuid,
  challenge_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- System can insert (via SECURITY DEFINER functions)
CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- Create function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  _event_type text,
  _user_id uuid DEFAULT NULL,
  _target_user_id uuid DEFAULT NULL,
  _challenge_id uuid DEFAULT NULL,
  _details jsonb DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO audit_logs (event_type, user_id, target_user_id, challenge_id, details)
  VALUES (_event_type, _user_id, _target_user_id, _challenge_id, _details);
END;
$$;

-- Update submit_flag to log submissions
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
  _max_attempts int := 10;
  _window_minutes int := 5;
  _challenge_title text;
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not authenticated');
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

-- Update prevent_score_manipulation to log attempts
CREATE OR REPLACE FUNCTION public.prevent_score_manipulation()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.total_points IS DISTINCT FROM NEW.total_points) OR 
     (OLD.challenges_solved IS DISTINCT FROM NEW.challenges_solved) OR
     (OLD.rank IS DISTINCT FROM NEW.rank) THEN
    IF current_setting('app.bypass_score_protection', true) IS DISTINCT FROM 'true' THEN
      -- Log the blocked manipulation attempt
      PERFORM log_audit_event('SCORE_MANIPULATION_BLOCKED', auth.uid(), OLD.user_id, NULL,
        jsonb_build_object(
          'attempted_points', NEW.total_points,
          'actual_points', OLD.total_points,
          'attempted_solves', NEW.challenges_solved,
          'actual_solves', OLD.challenges_solved
        )
      );
      NEW.total_points := OLD.total_points;
      NEW.challenges_solved := OLD.challenges_solved;
      NEW.rank := OLD.rank;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;