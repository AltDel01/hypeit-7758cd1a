import { ContentPlan } from './content-planner-item.interface';

export interface ContentPlanResponse {
  status: string;
  data: {
    calendar: ContentPlan;
  };
}
