import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export const SEEDREAM_CLIENT = 'SEEDREAM_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: SEEDREAM_CLIENT,
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>('SEEDREAM_API_KEY');

        if (!apiKey) {
          throw new Error(
            'SEEDREAM_API_KEY tidak ditemukan. Pastikan variabel lingkungan sudah disetel dan ConfigModule sudah dimuat.',
          );
        }

        return new OpenAI({
          apiKey,
          baseURL: 'https://ark.ap-southeast.bytepluses.com/api/v3',
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [SEEDREAM_CLIENT],
})
export class SeedreamModule {}
