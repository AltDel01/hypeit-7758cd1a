/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { ImageGeneratorController } from './image-generator.controller';
import { ImageGeneratorService } from './image-generator.service';
import axios from 'axios';
import { Readable } from 'stream';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ImageGeneratorController', () => {
  let controller: ImageGeneratorController;
  let service: ImageGeneratorService;

  const mockImageService = {
    generateFromUpload: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImageGeneratorController],
      providers: [
        {
          provide: ImageGeneratorService,
          useValue: mockImageService,
        },
      ],
    }).compile();

    controller = module.get<ImageGeneratorController>(ImageGeneratorController);
    service = module.get<ImageGeneratorService>(ImageGeneratorService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should stream generated image successfully', async () => {
    // mock service result
    mockImageService.generateFromUpload.mockResolvedValue({
      imageUrl: 'https://example.com/image.png',
    });

    // fake stream
    const fakeStream = new Readable({
      read() {
        this.push(Buffer.from('fake image data'));
        this.push(null); // end stream
    }});

    // mock axios.get
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: fakeStream,
    } as any);

    const mockRes: any = {
      set: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await controller.generate(
      { buffer: Buffer.from('img'), mimetype: 'image/png' } as any,
      'test prompt',
      mockRes,
    );

    expect(service.generateFromUpload).toHaveBeenCalled();
    expect(mockedAxios.get).toHaveBeenCalled();
    expect(mockRes.set).toHaveBeenCalledWith({
      'Content-Type': 'image/png',
      'Content-Disposition': 'inline',
    });
  });

  it('should return 404 if image fetch fails', async () => {
    mockImageService.generateFromUpload.mockResolvedValue({
      imageUrl: 'https://example.com/image.png',
    });

    mockedAxios.get.mockResolvedValue({
      status: 404,
      data: null,
    } as any);

    const mockRes: any = {
      set: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await controller.generate(
      { buffer: Buffer.from('img'), mimetype: 'image/png' } as any,
      'prompt',
      mockRes,
    );

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Image not found or failed to fetch image',
    });
  });

  it('should return 500 on streaming error', async () => {
    mockImageService.generateFromUpload.mockResolvedValue({
      imageUrl: 'https://example.com/image.png',
    });

    mockedAxios.get.mockRejectedValue(new Error('network error'));

    const mockRes: any = {
      set: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await controller.generate(
      { buffer: Buffer.from('img'), mimetype: 'image/png' } as any,
      'prompt',
      mockRes,
    );

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Failed to stream image',
    });
  });
});
