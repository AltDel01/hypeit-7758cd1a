import { Module } from '@nestjs/common';
import { ContentPlannerService } from './content-planner.service';
import { ContentPlannerController } from './content-planner.controller';
import { ContentPlannerJobs } from './jobs/content-planner.job';

@Module({
  providers: [ContentPlannerService, ContentPlannerJobs],
  controllers: [ContentPlannerController],
})
export class ContentPlannerModule {}
