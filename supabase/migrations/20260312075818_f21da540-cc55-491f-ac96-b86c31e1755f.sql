CREATE TABLE public.review_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.generation_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.review_feedback ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX idx_review_feedback_request_user ON public.review_feedback(request_id, user_id);

CREATE POLICY "Users can insert their own feedback"
  ON public.review_feedback FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own feedback"
  ON public.review_feedback FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all feedback"
  ON public.review_feedback FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Editors can read all feedback"
  ON public.review_feedback FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'editor'));