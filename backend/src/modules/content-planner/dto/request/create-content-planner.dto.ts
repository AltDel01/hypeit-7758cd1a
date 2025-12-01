import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateContentPlannerDto {
  @ApiProperty({
    example: 'Kopi Senja',
    description: 'Business name or brand identity',
  })
  @IsNotEmpty()
  @IsString()
  business: string;

  @ApiProperty({
    example: 'Food & Beverage',
    description: 'Industry of the business',
  })
  @IsNotEmpty()
  @IsString()
  industry: string;

  @ApiProperty({
    example: 'Urban millennials (20–35)',
    description: 'Target market segment',
  })
  @IsNotEmpty()
  @IsString()
  marketSegment: string;

  @ApiProperty({
    example: 'Daily Instagram content ideas for kopi shop',
    description: 'Initial content idea or direction',
  })
  @IsNotEmpty()
  @IsString()
  caption: string;
}
