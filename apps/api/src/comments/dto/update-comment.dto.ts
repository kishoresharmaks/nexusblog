import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({ description: 'Updated comment markdown / text content' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(3000)
  content!: string;
}
