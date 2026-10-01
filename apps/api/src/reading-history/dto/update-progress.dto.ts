import { IsString, IsNotEmpty, IsInt, Min, Max, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProgressDto {
  @ApiProperty({ description: 'MongoDB ObjectId of the article' })
  @IsString()
  @IsNotEmpty()
  articleId!: string;

  @ApiProperty({ description: 'Reading completion percentage (0 - 100)', example: 85 })
  @IsInt()
  @Min(0)
  @Max(100)
  completionPercentage!: number;

  @ApiProperty({ description: 'Last scroll or reading position offset', example: 1420.5, required: false })
  @IsOptional()
  @IsNumber()
  lastPosition?: number;
}
