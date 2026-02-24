
-- Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = id);

-- Allow users to delete their own generation requests
CREATE POLICY "Users can delete their own requests"
ON public.generation_requests
FOR DELETE
USING (auth.uid() = user_id);
