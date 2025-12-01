import { ApiProperty } from '@nestjs/swagger';

export class ContentPlannerResultResponseDto {
  @ApiProperty({
    example: 'cp_8f2a9c1',
  })
  jobId: string;

  @ApiProperty({
    example: 'completed',
    enum: ['completed'],
  })
  status: string;

  @ApiProperty({
    example: [
      'Senin, 1 Desember 2025',
      'Meet Our Berry Bliss Smoothie!',
      'Promotion',
      'Announce our vibrant Berry Bliss Smoothie, packed with real, fresh berries.',
      'Taste the freshness! 🍓 Try our Berry Bliss Smoothie today!',
    ],
  })
  contentPlan: string[];
}
