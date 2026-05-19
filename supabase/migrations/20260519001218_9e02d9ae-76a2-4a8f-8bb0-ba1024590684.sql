
-- Workflow definitions
CREATE TABLE public.tool_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tool_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own workflows" ON public.tool_workflows
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own workflows" ON public.tool_workflows
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own workflows" ON public.tool_workflows
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own workflows" ON public.tool_workflows
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins view all workflows" ON public.tool_workflows
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_tool_workflows_updated
  BEFORE UPDATE ON public.tool_workflows
  FOR EACH ROW EXECUTE FUNCTION public.update_generation_requests_updated_at();

-- Workflow run history
CREATE TABLE public.tool_workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workflow_id UUID REFERENCES public.tool_workflows(id) ON DELETE SET NULL,
  step_request_ids UUID[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'running',
  current_step INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tool_workflow_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own runs" ON public.tool_workflow_runs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own runs" ON public.tool_workflow_runs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own runs" ON public.tool_workflow_runs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own runs" ON public.tool_workflow_runs
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins view all runs" ON public.tool_workflow_runs
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_tool_workflow_runs_updated
  BEFORE UPDATE ON public.tool_workflow_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_generation_requests_updated_at();
