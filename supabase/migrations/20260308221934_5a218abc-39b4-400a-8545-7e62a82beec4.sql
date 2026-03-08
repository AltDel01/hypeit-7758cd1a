
-- Add assigned_at column
ALTER TABLE public.generation_requests ADD COLUMN IF NOT EXISTS assigned_at timestamptz;

-- RLS: Admins can view all user roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- RLS: Admins can view all profiles (for editor management)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));
