import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContentPlannerModule } from './modules/content-planner/content-planner.module';
import { ImageGeneratorModule } from './modules/image-generator/image-generator.module';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { GeminiModule } from './ai/llm/gemini/gemini.module';
import { SeedreamModule } from './ai/llm/seedream/seedream.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 15,
        },
      ],
    }),
    GeminiModule,
    SeedreamModule,
    ContentPlannerModule,
    ImageGeneratorModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    AppService,
  ],
})
export class AppModule {}
