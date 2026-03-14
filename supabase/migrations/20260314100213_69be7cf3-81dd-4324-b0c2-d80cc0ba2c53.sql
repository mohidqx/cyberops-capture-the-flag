
-- Site settings table for maintenance mode, feature toggles, branding
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage site settings"
  ON public.site_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default settings
INSERT INTO public.site_settings (key, value) VALUES
  ('maintenance_mode', '{"enabled": false, "message": "Site is under maintenance. Please check back later."}'::jsonb),
  ('feature_toggles', '{"registration": true, "leaderboard": true, "writeups": true, "teams": true, "contact_form": true}'::jsonb),
  ('branding', '{"site_name": "CyberOps CTF", "tagline": "Capture The Flag Competition", "footer_text": "© 2026 CyberOps CTF"}'::jsonb);

-- Admin function to update any user profile
CREATE OR REPLACE FUNCTION public.admin_update_user_profile(
  _target_username text,
  _updates jsonb
)
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
  
  IF NOT public.has_role(_admin_id, 'admin') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
  END IF;
  
  SELECT user_id INTO _target_user_id
  FROM profiles WHERE username = _target_username;
  
  IF _target_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'User not found');
  END IF;
  
  PERFORM set_config('app.bypass_score_protection', 'true', true);
  
  UPDATE profiles SET
    username = COALESCE(_updates->>'username', username),
    display_name = COALESCE(_updates->>'display_name', display_name),
    bio = COALESCE(_updates->>'bio', bio),
    country = COALESCE(_updates->>'country', country),
    avatar_url = COALESCE(_updates->>'avatar_url', avatar_url),
    updated_at = now()
  WHERE user_id = _target_user_id;
  
  PERFORM log_audit_event('ADMIN_PROFILE_UPDATE', _admin_id, _target_user_id, NULL,
    jsonb_build_object('username', _target_username, 'updates', _updates));
  
  RETURN jsonb_build_object('success', true, 'message', 'Profile updated');
END;
$$;

-- Admin function to change user role
CREATE OR REPLACE FUNCTION public.admin_set_user_role(
  _target_username text,
  _new_role app_role
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _target_user_id uuid;
  _admin_id uuid;
  _old_role app_role;
BEGIN
  _admin_id := auth.uid();
  
  IF NOT public.has_role(_admin_id, 'admin') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
  END IF;
  
  SELECT user_id INTO _target_user_id
  FROM profiles WHERE username = _target_username;
  
  IF _target_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'User not found');
  END IF;
  
  IF _target_user_id = _admin_id AND _new_role != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Cannot demote yourself');
  END IF;
  
  SELECT role INTO _old_role FROM user_roles WHERE user_id = _target_user_id LIMIT 1;
  
  INSERT INTO user_roles (user_id, role) VALUES (_target_user_id, _new_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  IF _old_role IS NOT NULL AND _old_role != _new_role THEN
    DELETE FROM user_roles WHERE user_id = _target_user_id AND role = _old_role;
  END IF;
  
  PERFORM log_audit_event('ADMIN_ROLE_CHANGE', _admin_id, _target_user_id, NULL,
    jsonb_build_object('username', _target_username, 'old_role', _old_role, 'new_role', _new_role));
  
  RETURN jsonb_build_object('success', true, 'message', format('Role changed to %s', _new_role));
END;
$$;

-- Admin function to delete a user account
CREATE OR REPLACE FUNCTION public.admin_delete_user(
  _target_username text
)
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
  
  IF NOT public.has_role(_admin_id, 'admin') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Unauthorized');
  END IF;
  
  SELECT user_id INTO _target_user_id
  FROM profiles WHERE username = _target_username;
  
  IF _target_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'User not found');
  END IF;
  
  IF _target_user_id = _admin_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Cannot delete yourself');
  END IF;
  
  PERFORM log_audit_event('ADMIN_USER_DELETED', _admin_id, _target_user_id, NULL,
    jsonb_build_object('username', _target_username));
  
  DELETE FROM user_roles WHERE user_id = _target_user_id;
  DELETE FROM hint_unlocks WHERE user_id = _target_user_id;
  DELETE FROM submissions WHERE user_id = _target_user_id;
  DELETE FROM user_sessions WHERE user_id = _target_user_id;
  
  PERFORM set_config('app.bypass_score_protection', 'true', true);
  DELETE FROM profiles WHERE user_id = _target_user_id;
  
  RETURN jsonb_build_object('success', true, 'message', format('User %s deleted', _target_username));
END;
$$;
