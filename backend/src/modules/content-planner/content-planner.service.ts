import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { CreateContentPlannerDto } from './dto/request/create-content-planner.dto';
import { randomUUID } from 'crypto';
import { ContentPlannerStore, JobData } from './store/content-planner.store';
import { ContentPlannerJobs } from './jobs/content-planner.job';
import { GEMINI_CLIENT } from '../../ai/llm/gemini/gemini.module';
import { ContentPlan } from './common/interfaces/content-planner-item.interface';
import { PDFDocument, rgb } from 'pdf-lib';
import {
  drawTextWithEmojiFallback,
  drawWrappedText,
  wrapText,
} from './utils/pdf.util';
import fs from 'fs';
import path from 'path';
import fontkit from '@pdf-lib/fontkit';

@Injectable()
export class ContentPlannerService {
  private readonly ai: GoogleGenAI;

  constructor(
    @Inject(GEMINI_CLIENT) ai: GoogleGenAI,
    private readonly contentPlannerJobs: ContentPlannerJobs,
  ) {
    this.ai = ai;
  }

  //==========GENERATE CONTENT PLANNER USE BACKGROUND JOB===========
  generate(dto: CreateContentPlannerDto) {
    try {
      const jobId = `cp_${randomUUID()}`;

      ContentPlannerStore.create(jobId);

      this.contentPlannerJobs.run(jobId, dto).catch((error) => {
        console.error(
          `Content Planner Job ${jobId} failed in background:`,
          error,
        );
        // Error handling is managed in ContentPlannerJobs.run
      });

      return {
        status: 'processing',
        jobId,
        message: 'Content planner sedang diproses',
      };
    } catch (error) {
      console.error('Content Planner Error:', error);
      throw new InternalServerErrorException('Failed to generate content plan');
    }
  }

  //==========GET RESULT OF JOB AFTER GENERATE STATUS COMPLETED==========
  getResult(jobId: string): JobData {
    const job = ContentPlannerStore.get(jobId);

    if (!job) {
      return { jobId: jobId, status: 'not_found' };
    }

    return job;
  }

  // =========EXPORT PDF LOGIC=========
  // Part tersusah dimulai hehe
  async exportPdf(jobId: string): Promise<Buffer> {
    const job = ContentPlannerStore.get(jobId);

    if (!job) {
      throw new BadRequestException('Job not found');
    }

    if (job.status !== 'completed' || !job.result) {
      throw new BadRequestException('Content not ready');
    }

    const calendar: ContentPlan = job.result;

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    let page = pdfDoc.addPage([595, 842]); // A4 page size

    // Konstanta untuk font dan layout
    const FONT_SIZE = 9;
    const LINE_GAP = 2; // Jarak antar baris di dalam satu sel (sama dengan di drawWrappedText)
    const VERTICAL_PADDING = 6; // Padding vertikal untuk baris (3 atas, 3 bawah)

    const textFontBytes = fs.readFileSync(
      path.join(process.cwd(), 'assets/fonts/NotoSans-Regular.ttf'),
    );

    const emojiFontBytes = fs.readFileSync(
      path.join(process.cwd(), 'assets/fonts/NotoEmoji-Regular.ttf'),
    );

    const textFont = await pdfDoc.embedFont(textFontBytes);
    const emojiFont = await pdfDoc.embedFont(emojiFontBytes);

    let y = 800;

    page.drawText('Content Calendar', {
      x: 40,
      y,
      size: 18,
      font: textFont,
    });

    y -= 30;

    // ===== TABLE COLUMN POSITIONS & WIDTHS =====
    const colX = {
      day: 40,
      title: 100,
      pillar: 200,
      prompt: 270,
      caption: 410,
    };

    const colWidth = {
      day: 60,
      title: 90,
      pillar: 70,
      prompt: 120,
      caption: 150,
    };

    const headerY = y; // Fungsi untuk menggambar Header

    const drawTableHeader = () => {
      page.drawText('Day', { x: colX.day, y, size: FONT_SIZE, font: textFont });
      page.drawText('Title', {
        x: colX.title,
        y,
        size: FONT_SIZE,
        font: textFont,
      });
      page.drawText('Pillar', {
        x: colX.pillar,
        y,
        size: FONT_SIZE,
        font: textFont,
      });
      page.drawText('Prompt', {
        x: colX.prompt,
        y,
        size: FONT_SIZE,
        font: textFont,
      });
      page.drawText('Caption', {
        x: colX.caption,
        y,
        size: FONT_SIZE,
        font: textFont,
      });
      y -= 24; // Jarak dari header ke baris data pertama
    };

    drawTableHeader();

    for (const item of calendar) {
      // Menghitung jumlah baris yang dihasilkan oleh setiap kolom menggunakan wrapText
      const linesDay = wrapText(item.day, textFont, FONT_SIZE, colWidth.day);
      const linesTitle = wrapText(
        item.title,
        textFont,
        FONT_SIZE,
        colWidth.title,
      );
      const linesPrompt = wrapText(
        item.prompt,
        textFont,
        FONT_SIZE,
        colWidth.prompt,
      );
      const linesCaption = wrapText(
        item.caption,
        textFont,
        FONT_SIZE,
        colWidth.caption,
      );

      const maxLines = Math.max(
        linesDay.length,
        linesTitle.length,
        linesPrompt.length,
        linesCaption.length,
        1, // Minimal 1 baris
      );

      // Menentukan Tinggi Baris Total: (jumlah baris * ukuran font) + ((jumlah baris - 1) * lineGap) + padding
      const rowHeight =
        maxLines * FONT_SIZE +
        Math.max(0, maxLines - 1) * LINE_GAP +
        VERTICAL_PADDING;

      // --- 2. Cek Pindah Halaman ---
      if (y - rowHeight < 80) {
        // Jika tidak cukup untuk baris ini (margin bawah 80)
        page = pdfDoc.addPage([595, 842]); // Tambah halaman
        y = headerY; // Reset posisi header
        drawTableHeader(); // Buat header baru
      }

      // --- 3. Gambar Teks Menggunakan drawWrappedText ---
      // A. Kolom Day
      drawWrappedText(page, item.day, colX.day, y, {
        textFont,
        emojiFont,
        size: FONT_SIZE,
        maxWidth: colWidth.day,
        lineGap: LINE_GAP,
      });

      // B. Kolom Title (Dibungkus, Mulai dari y Awal/Atas)
      drawWrappedText(page, item.title, colX.title, y, {
        textFont,
        emojiFont,
        size: FONT_SIZE,
        maxWidth: colWidth.title,
        lineGap: LINE_GAP,
      });

      // C. Kolom Pillar
      drawTextWithEmojiFallback({
        page,
        text: String(item.pillar),
        x: colX.pillar,
        y,
        size: 9,
        textFont,
        emojiFont,
        maxWidth: colWidth.pillar,
      });

      // D. Kolom Prompt (Dibungkus, Mulai dari y Awal/Atas)
      drawWrappedText(page, item.prompt, colX.prompt, y, {
        textFont,
        emojiFont,
        size: FONT_SIZE,
        maxWidth: colWidth.prompt,
        lineGap: LINE_GAP,
      });

      // E. Kolom Caption (Dibungkus, Mulai dari y Awal/Atas)
      drawWrappedText(page, item.caption, colX.caption, y, {
        textFont,
        emojiFont,
        size: FONT_SIZE,
        maxWidth: colWidth.caption,
        lineGap: LINE_GAP,
      });

      // Garis pemisah antar baris
      page.drawLine({
        start: { x: 40, y: y - rowHeight + 10 }, // sedikit di atas garis y baru
        end: { x: 550, y: y - rowHeight + 10 },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });

      // --- 4. Pindah ke Posisi Y Baris Berikutnya ---
      y -= rowHeight;
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  async enhancedPrompt(prompt: string): Promise<{ enhancedPrompt: string }> {
    try {
      if (!prompt) {
        throw new BadRequestException('Prompt must be filled');
      }

      const model = 'gemini-2.5-flash';

      const response = await this.ai.models.generateContent({
        model: model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: `
            Rewrite the user's input into creative, precision, and one concise prompt depends on user input purpose. If for image generation, use clear and detailed natural language to describe the scene from user's text instruction. For complex images, describe elements thoroughly to control the output precisely.

            Maximum 70 words.
            Plain text only.
            No explanations.
          `,
        },
      });

      const enhancedText = response?.text;

      // Cek teks valid, harus ada & tipe string
      if (!enhancedText || typeof enhancedText !== 'string') {
        throw new InternalServerErrorException('Invalid AI response');
      }

      return {
        enhancedPrompt: enhancedText.trim(),
      };
    } catch (error) {
      console.error('[Enhance Prompt Error]', error);
      throw new InternalServerErrorException('Failed to enhance prompt');
    }
  }
}
