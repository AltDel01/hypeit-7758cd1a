import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class EnhancePromptDto {
  @ApiProperty({
    example: 'Morning coffee promo caption for Instagram',
    description: 'Base caption that will be enhanced by AI',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  caption: string;
}
