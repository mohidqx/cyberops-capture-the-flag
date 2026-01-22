-- Create atomic function for hint unlocking to prevent race conditions
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

-- Add unique constraint on hint_unlocks if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'hint_unlocks_user_challenge_hint_unique'
  ) THEN
    ALTER TABLE public.hint_unlocks 
    ADD CONSTRAINT hint_unlocks_user_challenge_hint_unique 
    UNIQUE (user_id, challenge_id, hint_index);
  END IF;
END $$;