-- Create table for VK clips
CREATE TABLE public.vk_clips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  vk_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vk_clips ENABLE ROW LEVEL SECURITY;

-- Anyone can view active clips
CREATE POLICY "Anyone can view active clips"
ON public.vk_clips
FOR SELECT
USING (is_active = true);

-- Admins can manage clips
CREATE POLICY "Admins can manage clips"
ON public.vk_clips
FOR ALL
USING (is_admin_or_manager(auth.uid()))
WITH CHECK (is_admin_or_manager(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_vk_clips_updated_at
BEFORE UPDATE ON public.vk_clips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();