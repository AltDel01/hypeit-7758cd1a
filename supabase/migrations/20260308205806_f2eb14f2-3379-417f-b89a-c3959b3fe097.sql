ALTER TABLE public.generation_requests 
  ADD COLUMN assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN assigned_to_name text;