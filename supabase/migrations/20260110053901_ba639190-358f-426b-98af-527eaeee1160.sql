-- Create hint unlocks tracking table
CREATE TABLE public.hint_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  hint_index INTEGER NOT NULL,
  points_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, challenge_id, hint_index)
);

-- Enable RLS
ALTER TABLE public.hint_unlocks ENABLE ROW LEVEL SECURITY;

-- Policies for hint unlocks
CREATE POLICY "Users can view own unlocks" ON public.hint_unlocks FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create unlocks" ON public.hint_unlocks FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Add hint costs to challenges (array of costs per hint)
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS hint_costs INTEGER[] DEFAULT '{}';

-- Create competition settings table
CREATE TABLE public.competition_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'default',
  is_active BOOLEAN DEFAULT false,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  freeze_time TIMESTAMPTZ,
  decay_enabled BOOLEAN DEFAULT false,
  decay_minimum INTEGER DEFAULT 50,
  team_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.competition_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can view settings
CREATE POLICY "Settings viewable by all" ON public.competition_settings FOR SELECT USING (true);
-- Only admins can modify
CREATE POLICY "Admins can manage settings" ON public.competition_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Insert default competition settings
INSERT INTO public.competition_settings (name, is_active, team_mode) VALUES ('default', false, false);

-- Add first_blood tracking to submissions
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS is_first_blood BOOLEAN DEFAULT false;

-- Create function to update team points when member solves
CREATE OR REPLACE FUNCTION public.update_team_points()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_correct = true THEN
    -- Update team total points if user is on a team
    UPDATE public.teams t
    SET total_points = (
      SELECT COALESCE(SUM(p.total_points), 0)
      FROM public.profiles p
      WHERE p.team_id = t.id
    )
    WHERE t.id IN (
      SELECT team_id FROM public.profiles WHERE user_id = NEW.user_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for team points
CREATE TRIGGER on_submission_update_team
  AFTER INSERT ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_team_points();

-- Add trigger for updated_at on competition_settings
CREATE TRIGGER handle_competition_settings_updated_at
  BEFORE UPDATE ON public.competition_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();