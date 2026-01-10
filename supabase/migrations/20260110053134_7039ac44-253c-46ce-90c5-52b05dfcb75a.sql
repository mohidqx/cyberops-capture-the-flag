-- Enable realtime for submissions to track live solves
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;

-- Enable realtime for challenges to track new challenges
ALTER PUBLICATION supabase_realtime ADD TABLE public.challenges;

-- Add notification preferences to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true;