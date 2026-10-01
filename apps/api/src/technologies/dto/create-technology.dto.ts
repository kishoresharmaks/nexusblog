import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateTechnologyDto {
  @ApiProperty({ example: 'Redis' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'redis' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiPropertyOptional({ example: 'In-memory data structure store used as a database, cache, and message broker.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://cdn.url/logos/redis.svg' })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiPropertyOptional({ example: 'https://redis.io' })
  @IsUrl()
  @IsOptional()
  officialUrl?: string;

  @ApiPropertyOptional({ example: 'https://redis.io/docs' })
  @IsUrl()
  @IsOptional()
  docsUrl?: string;
}
