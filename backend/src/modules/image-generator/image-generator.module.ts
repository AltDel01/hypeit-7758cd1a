import { Module } from '@nestjs/common';
import { ImageGeneratorService } from './image-generator.service';
import { ImageGeneratorController } from './image-generator.controller';

@Module({
  controllers: [ImageGeneratorController],
  providers: [ImageGeneratorService],
})
export class ImageGeneratorModule {}
