import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'MongoDB ObjectId of the target article' })
  @IsString()
  @IsNotEmpty()
  articleId!: string;

  @ApiProperty({ description: 'Comment markdown / text content', example: 'Great breakdown of the Raft leader election phase!' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(3000)
  content!: string;

  @ApiPropertyOptional({ description: 'MongoDB ObjectId of parent comment if this is a reply' })
  @IsOptional()
  @IsString()
  parentId?: string;
}
