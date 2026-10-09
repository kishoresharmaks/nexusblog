import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreatePageDto {
  @ApiProperty({ example: 'Privacy Policy' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'privacy-policy' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ example: '# Privacy Policy\n\nWe value your privacy...' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({ example: 'Learn about our data handling and privacy commitments.' })
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @ApiPropertyOptional({ example: 'Privacy Policy | NexusNation' })
  @IsString()
  @IsOptional()
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'Comprehensive privacy policy and security practices for NexusNation.' })
  @IsString()
  @IsOptional()
  seoDescription?: string;
}
