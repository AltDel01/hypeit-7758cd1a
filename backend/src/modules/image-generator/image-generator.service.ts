/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { GoogleGenAI } from '@google/genai';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import OpenAI from 'openai';
import { GEMINI_CLIENT } from 'src/ai/llm/gemini/gemini.module';
import { SEEDREAM_CLIENT } from 'src/ai/llm/seedream/seedream.module';

@Injectable()
export class ImageGeneratorService {
  constructor(
    @Inject(SEEDREAM_CLIENT) private readonly seedreamAi: OpenAI,
    @Inject(GEMINI_CLIENT) private readonly geminiAi: GoogleGenAI,
  ) {}

  async generateFromUpload(prompt: string, file: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new InternalServerErrorException('Image file is required');
    }

    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      throw new InternalServerErrorException('Invalid image type');
    }

    //data URL (WAJIB)
    const base64 = file.buffer.toString('base64');

    // Vision (text + image)
    const vision = await this.geminiAi.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: file.mimetype,
                data: base64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        systemInstruction: `
        You are an expert AI Image Prompt Engineer specialized in content and marketing visuals.
        Your task is to convert the user's text instruction into a clear, high-quality image generation prompt suitable for business and content use.

        STRICT RULES:
        1. Output ONLY the raw prompt. No explanations, no quotes, no markdown.
        2. Focus on: subject, environment, composition, lighting, color tone, and visual mood.
        3. Prioritize clarity, relevance to content, and professional appearance.
        4. Format as a concise, comma-separated description using natural language.
        5. Include quality modifiers such as: sharp focus, high detail, clean composition, professional lighting.
        6. Avoid unnecessary artistic exaggeration.
        7. Maximum length: 50 words.

        `,
      },
    });

    const refinedPrompt = vision.text;
    if (!refinedPrompt) {
      throw new InternalServerErrorException(
        'Vision model returned empty prompt',
      );
    }

    // Image generation
    const result = await this.seedreamAi.images.generate({
      model: 'seedream-4-0-250828',
      prompt: refinedPrompt,
      size: '1792x1024',
      quality: 'hd',
      response_format: 'url',
    });

    if (!result.data || result.data.length === 0) {
      throw new InternalServerErrorException('Image generation failed');
    }

    return {
      imageUrl: result.data[0].url!,
    };
  }
}
