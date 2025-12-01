import { ContentPlan } from '../common/interfaces/content-planner-item.interface';

export type JobStatus = 'processing' | 'completed' | 'failed' | 'not_found';

export interface JobData {
  jobId: string;
  status: JobStatus;
  result?: ContentPlan;
  error?: string;
}

const store = new Map<string, JobData>();

export const ContentPlannerStore = {
  create(jobId: string) {
    store.set(jobId, { jobId: jobId, status: 'processing' });
  },

  complete(jobId: string, result: ContentPlan) {
    store.set(jobId, { jobId: jobId, status: 'completed', result });
  },

  fail(jobId: string, error: string) {
    store.set(jobId, { jobId: jobId, status: 'failed', error });
  },

  get(jobId: string): JobData | undefined {
    return store.get(jobId);
  },
};
