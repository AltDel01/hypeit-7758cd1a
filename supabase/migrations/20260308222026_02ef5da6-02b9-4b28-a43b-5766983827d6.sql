
-- RLS: Editors can view requests assigned to them
CREATE POLICY "Editors can view assigned requests"
ON public.generation_requests
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'editor') AND assigned_to = auth.uid()
);

-- RLS: Editors can update requests assigned to them  
CREATE POLICY "Editors can update assigned requests"
ON public.generation_requests
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'editor') AND assigned_to = auth.uid()
);

-- Editors can view their own profile
CREATE POLICY "Editors can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'editor') AND auth.uid() = id
);
