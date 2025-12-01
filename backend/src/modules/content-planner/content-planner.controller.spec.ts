import { Test, TestingModule } from '@nestjs/testing';
import { ContentPlannerController } from './content-planner.controller';
import { ContentPlannerService } from './content-planner.service';
import { Response } from 'express';

describe('ContentPlannerController', () => {
  let controller: ContentPlannerController;
  let service: ContentPlannerService;

  const mockService = {
    generate: jest.fn(),
    getResult: jest.fn(),
    enhancedPrompt: jest.fn(),
    exportPdf: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentPlannerController],
      providers: [
        {
          provide: ContentPlannerService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ContentPlannerController>(
      ContentPlannerController,
    );
    service = module.get<ContentPlannerService>(ContentPlannerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should start content planner generation', async () => {
    const dto: any = { businessName: 'Test Biz' };
    const result = { jobId: 'job-123', status: 'processing' };

    mockService.generate.mockResolvedValue(result);

    const response = await controller.generate(dto);

    expect(service.generate).toHaveBeenCalledWith(dto);
    expect(response).toEqual(result);
  });

  it('should enhance prompt successfully', async () => {
    mockService.enhancedPrompt.mockResolvedValue({
      enhancedPrompt: 'Better caption result',
    });

    const response = await controller.enhancePrompt({
      caption: 'raw caption',
    });

    expect(service.enhancedPrompt).toHaveBeenCalledWith('raw caption');
    expect(response).toEqual({
      enhancedPrompt: 'Better caption result',
    });
  });

  it('should get content planner result by jobId', async () => {
    const result = {
      status: 'completed',
      data: [],
    };

    mockService.getResult.mockResolvedValue(result);

    const response = await controller.getResult('job-123');

    expect(service.getResult).toHaveBeenCalledWith('job-123');
    expect(response).toEqual(result);
  });

  it('should export content calendar as PDF', async () => {
    const pdfBuffer = Buffer.from('pdf-bytes');
    mockService.exportPdf.mockResolvedValue(pdfBuffer);

    const res: Partial<Response> = {
      setHeader: jest.fn(),
      end: jest.fn(),
    };

    await controller.exportCalendarPdf('job-123', res as Response);

    expect(service.exportPdf).toHaveBeenCalledWith('job-123');
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/pdf',
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="content-calendar.pdf"',
    );
    expect(res.end).toHaveBeenCalled();
  });
});
