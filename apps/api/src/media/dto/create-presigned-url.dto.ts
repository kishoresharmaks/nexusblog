import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePresignedUrlDto {
  @ApiProperty({ example: 'architecture-diagram.png' })
  @IsString()
  @IsNotEmpty()
  filename!: string;

  @ApiProperty({ example: 'image/png' })
  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @ApiPropertyOptional({ example: 'Distributed cache architecture diagram' })
  @IsString()
  @IsOptional()
  alt?: string;
}

export class ConfirmUploadDto {
  @ApiProperty({ example: 'media/2026/10/8f3b/original.png' })
  @IsString()
  @IsNotEmpty()
  storageKey!: string;

  @ApiProperty({ example: 'architecture-diagram.png' })
  @IsString()
  @IsNotEmpty()
  originalName!: string;

  @ApiProperty({ example: 'image/png' })
  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @ApiProperty({ example: 245000 })
  @IsNotEmpty()
  size!: number;

  @ApiPropertyOptional({ example: 'Distributed cache diagram' })
  @IsString()
  @IsOptional()
  alt?: string;

  @ApiPropertyOptional({ example: 'Figure 1: Cache cluster coordination' })
  @IsString()
  @IsOptional()
  caption?: string;
}
