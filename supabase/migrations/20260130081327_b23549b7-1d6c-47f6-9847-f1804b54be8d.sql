-- Create generation_requests table
CREATE TABLE public.generation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_email text NOT NULL,
  user_name text,
  request_type text NOT NULL CHECK (request_type IN ('video', 'image')),
  prompt text NOT NULL,
  aspect_ratio text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'in-progress', 'completed', 'failed')),
  reference_image_url text,
  result_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS
ALTER TABLE public.generation_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view their own requests"
ON public.generation_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create their own requests"
ON public.generation_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view ALL requests
CREATE POLICY "Admins can view all requests"
ON public.generation_requests
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update ALL requests
CREATE POLICY "Admins can update all requests"
ON public.generation_requests
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_generation_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_generation_requests_updated_at
BEFORE UPDATE ON public.generation_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_generation_requests_updated_at();