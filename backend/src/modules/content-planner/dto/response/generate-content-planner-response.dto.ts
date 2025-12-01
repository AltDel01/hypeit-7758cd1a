import { ApiProperty } from '@nestjs/swagger';

export class GenerateContentPlannerResponseDto {
  @ApiProperty({
    example: 'cp_8f2a9c1...',
    description: 'Unique job identifier for AI generation process',
  })
  jobId: string;

  @ApiProperty({
    example: 'processing',
    enum: ['processing'],
    description: 'Current job status',
  })
  status: string;
}
