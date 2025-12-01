import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

export const GEMINI_CLIENT = 'GEMINI_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: GEMINI_CLIENT,
      useFactory: (config: ConfigService) => {
        const apiKey = config.get<string>('GEMINI_API_KEY');

        if (!apiKey) {
          throw new Error(
            'GEMINI_API_KEY tidak ditemukan. Pastikan variabel lingkungan sudah disetel dan ConfigModule sudah dimuat.',
          );
        }

        return new GoogleGenAI({ apiKey });
      },
      inject: [ConfigService],
    },
  ],
  exports: [GEMINI_CLIENT],
})
export class GeminiModule {}
