-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can create teams" ON public.teams;

-- Create a more specific policy that validates the captain is the creator
CREATE POLICY "Users can create teams as captain"
  ON public.teams FOR INSERT
  TO authenticated
  WITH CHECK (
    captain_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR captain_id IS NULL
  );