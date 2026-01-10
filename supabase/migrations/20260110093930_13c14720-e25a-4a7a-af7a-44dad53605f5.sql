-- Drop existing permissive SELECT policies on challenges
DROP POLICY IF EXISTS "Active challenges are viewable by everyone" ON public.challenges;
DROP POLICY IF EXISTS "Admins can view all challenges" ON public.challenges;

-- Create a more restrictive SELECT policy that uses a function to filter columns
-- First, create a secure view that excludes the flag for non-admins
CREATE OR REPLACE VIEW public.challenges_public AS
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

-- Update RLS policies - only admins can directly select from challenges table (which includes flag)
CREATE POLICY "Only admins can read challenges with flags"
ON public.challenges
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Keep the admin management policy
-- (Already exists: "Admins can manage challenges" for ALL operations)