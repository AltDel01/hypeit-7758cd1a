/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { GoogleGenAI } from '@google/genai';
import { ContentPlannerStore } from '../store/content-planner.store';
import { Inject, Injectable } from '@nestjs/common';
import { CreateContentPlannerDto } from '../dto/request/create-content-planner.dto';
import { cleanAndParseJson } from '../utils/content-planner.util';

@Injectable()
export class ContentPlannerJobs {
  private readonly ai: GoogleGenAI;

  constructor(@Inject('GEMINI_CLIENT') ai: GoogleGenAI) {
    this.ai = ai;
  }

  async run(jobId: string, dto: CreateContentPlannerDto) {
    const startTime = Date.now();
    // console.log(`[${jobId}] Starting generation...`);

    try {
      const response = await this.withTimeout(
        this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: this.buildPrompt(dto),
          config: {
            temperature: 0.4,
            maxOutputTokens: 4500,
          },
        }),
        30000,
      );

      const rawText = response?.text;

      if (
        !rawText ||
        typeof rawText !== 'string' ||
        rawText.trim().length === 0
      ) {
        throw new Error('AI returned empty response');
      }

      const finalData = cleanAndParseJson(rawText);

      // Tanggal Mulai (besok)
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() + 1);

      const mapped = finalData.map((row, index) => {
        const [title, pillar, prompt, caption] = row;

        // Hitung tanggal
        const currentDate = new Date(startDate);

        // Tambah hari
        currentDate.setDate(startDate.getDate() + index);

        // Format tanggal Indonesia
        const formattedDate = new Intl.DateTimeFormat('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(currentDate);

        return {
          day: formattedDate,
          title,
          pillar,
          prompt,
          caption,
        };
      });

      ContentPlannerStore.complete(jobId, mapped);
    } catch (error: any) {
      const totalTime = Date.now() - startTime;
      console.error(`[${jobId}] Failed after ${totalTime}ms:`, error.message);
      console.error('Error stack:', error.stack);
      ContentPlannerStore.fail(jobId, error.message);
    }
  }

  private withTimeout<T>(promise: Promise<T>, ms = 30000): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI_TIMEOUT')), ms),
      ),
    ]);
  }

  private buildPrompt(dto: CreateContentPlannerDto): string {
    return `Generate a content plan for 15 days.

      Business Context:
      - Name: ${dto.business}
      - Industry: ${dto.industry}
      - Target Audience: ${dto.marketSegment}
      - Content Focus: ${dto.caption}

      RULES:
      1. Output must be a STRICTLY VALID JSON Array of Arrays.
      2. NO keys, NO markdown, NO code blocks. Just the raw array.
      3. Strict Order per item: [title, pillar, content brief, caption]
      4. Mix pillars evenly: ~4 Branding, ~4 Education, ~4 Promotion, ~3 Engagement
      5. Constraints:
        - Content brief: Short description of the content idea or message angle
          (NOT a visual description), max 20 words
        - Caption: Engaging with CTA and relate emoji (max 15 words)

      Example Format:
      [["Title 1", "Welcome to ...", "Pillar 1...", "Content brief 1...", "Caption 1..."], ["Title 2", ...]]

      Generate Now!
    `;
  }
}
