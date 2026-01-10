-- Drop the security definer view and recreate with SECURITY INVOKER
DROP VIEW IF EXISTS public.challenges_public;

CREATE VIEW public.challenges_public 
WITH (security_invoker = true)
AS
SELECT 
  id,
  title,
  description,
  category,
  difficulty,
  points,
  solves,
  files,
  hints,
  hint_costs,
  author_id,
  is_active,
  created_at,
  updated_at
FROM public.challenges
WHERE is_active = true;

-- Grant access to the view
GRANT SELECT ON public.challenges_public TO authenticated;
GRANT SELECT ON public.challenges_public TO anon;

-- Create a secure function to validate flags without exposing them
CREATE OR REPLACE FUNCTION public.validate_challenge_flag(
  _challenge_id uuid,
  _submitted_flag text
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.challenges 
    WHERE id = _challenge_id 
      AND flag = _submitted_flag
      AND is_active = true
  )
$$;