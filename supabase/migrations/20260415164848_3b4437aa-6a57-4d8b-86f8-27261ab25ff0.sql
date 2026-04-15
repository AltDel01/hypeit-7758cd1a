
-- Create storage bucket for CV uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('career-applications', 'career-applications', false);

-- Create career applications table
CREATE TABLE public.career_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  position text NOT NULL,
  application_type text NOT NULL DEFAULT 'full-time',
  cv_url text,
  portfolio_url text,
  cover_letter text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit an application (public form)
CREATE POLICY "Anyone can submit applications"
  ON public.career_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
  ON public.career_applications FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update applications
CREATE POLICY "Admins can update applications"
  ON public.career_applications FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete applications
CREATE POLICY "Admins can delete applications"
  ON public.career_applications FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Storage policies for career-applications bucket
CREATE POLICY "Anyone can upload CVs"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'career-applications');

CREATE POLICY "Admins can view career files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'career-applications' AND public.has_role(auth.uid(), 'admin'));
