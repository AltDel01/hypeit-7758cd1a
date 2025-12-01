/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

import { ImageGeneratorService } from './image-generator.service';
import { GEMINI_CLIENT } from 'src/ai/llm/gemini/gemini.module';
import { SEEDREAM_CLIENT } from 'src/ai/llm/seedream/seedream.module';

describe('ImageGeneratorService', () => {
  let service: ImageGeneratorService;

  // ---- MOCKS ----
  const mockGemini = {
    models: {
      generateContent: jest.fn(),
    },
  } as unknown as GoogleGenAI;

  const mockSeedream = {
    images: {
      generate: jest.fn(),
    },
  } as unknown as OpenAI;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageGeneratorService,
        {
          provide: GEMINI_CLIENT,
          useValue: mockGemini,
        },
        {
          provide: SEEDREAM_CLIENT,
          useValue: mockSeedream,
        },
      ],
    }).compile();

    service = module.get<ImageGeneratorService>(ImageGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate image from uploaded image and prompt', async () => {
    // Mock Gemini response
    (mockGemini.models.generateContent as jest.Mock).mockResolvedValue({
      text: 'professional product photo, clean background, sharp focus',
    });

    // Mock Seedream response
    (mockSeedream.images.generate as jest.Mock).mockResolvedValue({
      data: [
        {
          url: 'https://example.com/generated-image.png',
        },
      ],
    });

    const mockFile = {
      buffer: Buffer.from('fake-image'),
      mimetype: 'image/png',
    } as Express.Multer.File;

    const result = await service.generateFromUpload(
      'Generate marketing image',
      mockFile,
    );

    expect(mockGemini.models.generateContent).toHaveBeenCalled();
    expect(mockSeedream.images.generate).toHaveBeenCalled();

    expect(result).toEqual({
      imageUrl: 'https://example.com/generated-image.png',
    });
  });

  it('should throw error if file is missing', async () => {
    await expect(
      service.generateFromUpload('prompt', undefined as any),
    ).rejects.toThrow(InternalServerErrorException);
  });

  it('should throw error if file type is not image', async () => {
    const mockFile = {
      buffer: Buffer.from('not-an-image'),
      mimetype: 'application/pdf',
    } as Express.Multer.File;

    await expect(
      service.generateFromUpload('prompt', mockFile),
    ).rejects.toThrow('Invalid image type');
  });

  it('should throw error if vision model returns empty prompt', async () => {
    (mockGemini.models.generateContent as jest.Mock).mockResolvedValue({
      text: '',
    });

    const mockFile = {
      buffer: Buffer.from('fake-image'),
      mimetype: 'image/jpeg',
    } as Express.Multer.File;

    await expect(
      service.generateFromUpload('prompt', mockFile),
    ).rejects.toThrow('Vision model returned empty prompt');
  });

  it('should throw error if image generation fails', async () => {
    (mockGemini.models.generateContent as jest.Mock).mockResolvedValue({
      text: 'valid prompt',
    });

    (mockSeedream.images.generate as jest.Mock).mockResolvedValue({
      data: [],
    });

    const mockFile = {
      buffer: Buffer.from('fake-image'),
      mimetype: 'image/png',
    } as Express.Multer.File;

    await expect(
      service.generateFromUpload('prompt', mockFile),
    ).rejects.toThrow('Image generation failed');
  });
});
