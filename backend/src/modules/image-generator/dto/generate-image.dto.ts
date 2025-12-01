import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateImageDto {
  @ApiProperty({
    example:
      'Photorealistic portrait, smiling redhead woman, freckles, soft light, autumn background.',
    description:
      'A concise visual description used as a prompt for AI image generation.',
  })
  @IsNotEmpty()
  @IsString()
  prompt: string;
}
