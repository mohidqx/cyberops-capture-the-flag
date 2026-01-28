-- Add is_banned and ban_reason columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS ban_reason text,
ADD COLUMN IF NOT EXISTS banned_at timestamptz,
ADD COLUMN IF NOT EXISTS banned_by uuid REFERENCES auth.users(id);

-- Create index for quick banned user lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON public.profiles(is_banned) WHERE is_banned = true;

-- Create admin function to ban/unban users
CREATE OR REPLACE FUNCTION public.admin_ban_user(_username text, _reason text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _target_user_id uuid;
  _admin_id uuid;
BEGIN
  _admin_id := auth.uid();
  
  -- Get target user
  SELECT user_id INTO _target_user_id
  FROM profiles WHERE username = _username;
  
  IF _target_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'User not found');
  END IF;
  
  -- Prevent self-ban
  IF _target_user_id = _admin_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Cannot ban yourself');
  END IF;
  
  -- Set bypass flag for this transaction
  PERFORM set_config('app.bypass_score_protection', 'true', true);
  
  -- Ban the user
  UPDATE profiles
  SET 
    is_banned = true,
    ban_reason = _reason,
    banned_at = now(),
    banned_by = _admin_id
  WHERE user_id = _target_user_id;
  
  -- Log the ban
  PERFORM log_audit_event('USER_BANNED', _admin_id, _target_user_id, NULL,
    jsonb_build_object(
      'username', _username,
      'reason', _reason
    )
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'User banned successfully',
    'username', _username
  );
END;
$$;

-- Create admin function to unban users
CREATE OR REPLACE FUNCTION public.admin_unban_user(_username text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _target_user_id uuid;
  _admin_id uuid;
BEGIN
  _admin_id := auth.uid();
  
  -- Get target user
  SELECT user_id INTO _target_user_id
  FROM profiles WHERE username = _username;
  
  IF _target_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'User not found');
  END IF;
  
  -- Set bypass flag for this transaction
  PERFORM set_config('app.bypass_score_protection', 'true', true);
  
  -- Unban the user
  UPDATE profiles
  SET 
    is_banned = false,
    ban_reason = NULL,
    banned_at = NULL,
    banned_by = NULL
  WHERE user_id = _target_user_id;
  
  -- Log the unban
  PERFORM log_audit_event('USER_UNBANNED', _admin_id, _target_user_id, NULL,
    jsonb_build_object('username', _username)
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'User unbanned successfully',
    'username', _username
  );
END;
$$;