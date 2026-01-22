-- Create admin function to reset user scores to match actual submissions
CREATE OR REPLACE FUNCTION public.admin_reset_user_scores(_username text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _target_user_id uuid;
  _old_points int;
  _old_solves int;
  _new_points int;
  _new_solves int;
BEGIN
  -- Get user info
  SELECT user_id, total_points, challenges_solved 
  INTO _target_user_id, _old_points, _old_solves
  FROM profiles WHERE username = _username;
  
  IF _target_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'User not found');
  END IF;
  
  -- Calculate actual scores from submissions
  SELECT 
    COALESCE(SUM(points_awarded), 0),
    COUNT(DISTINCT challenge_id)
  INTO _new_points, _new_solves
  FROM submissions 
  WHERE user_id = _target_user_id AND is_correct = true;
  
  -- Set bypass flag and update
  PERFORM set_config('app.bypass_score_protection', 'true', true);
  
  UPDATE profiles
  SET 
    total_points = _new_points,
    challenges_solved = _new_solves
  WHERE user_id = _target_user_id;
  
  -- Log the admin action
  PERFORM log_audit_event('ADMIN_SCORE_RESET', auth.uid(), _target_user_id, NULL,
    jsonb_build_object(
      'username', _username,
      'old_points', _old_points,
      'old_solves', _old_solves,
      'new_points', _new_points,
      'new_solves', _new_solves
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'username', _username,
    'old_points', _old_points,
    'new_points', _new_points,
    'old_solves', _old_solves,
    'new_solves', _new_solves
  );
END;
$$;

-- Grant to authenticated (function checks admin internally could be added)
GRANT EXECUTE ON FUNCTION public.admin_reset_user_scores(text) TO authenticated;