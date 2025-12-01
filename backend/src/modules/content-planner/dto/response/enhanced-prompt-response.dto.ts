import { ApiProperty } from '@nestjs/swagger';

export class EnhancePromptResponseDto {
  @ApiProperty({
    example:
      'Write an engaging Instagram caption promoting a morning coffee offer, using warm and friendly tone, with subtle call-to-action.',
    description: 'AI-enhanced prompt ready to be used for content generation',
  })
  enhancedPrompt: string;
}
