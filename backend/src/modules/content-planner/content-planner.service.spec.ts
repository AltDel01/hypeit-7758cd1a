import { Test, TestingModule } from '@nestjs/testing';
import { ContentPlannerService } from './content-planner.service';
import { GEMINI_CLIENT } from 'src/ai/llm/gemini/gemini.module';
import { ContentPlannerJobs } from './jobs/content-planner.job';

describe('ContentPlannerService', () => {
  let service: ContentPlannerService;

  const mockJobs = {
    run: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentPlannerService,
        {
          provide: ContentPlannerJobs,
          useValue: mockJobs,
        },
        {
          provide: GEMINI_CLIENT,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get(ContentPlannerService);
  });

  it('should create job and return processing status', () => {
    const dto = {
      business: 'test',
      industry: 'Food',
      marketSegment: 'Youth',
      caption: 'Test caption',
    };

    const result = service.generate(dto);

    expect(result.status).toBe('processing');
    expect(result.jobId).toBeDefined();
    expect(mockJobs.run).toHaveBeenCalled();
  });
});
