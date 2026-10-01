import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Alex Developer' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: 'https://avatar.url/me.png' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({ example: 'Backend systems engineer & distributed systems enthusiast.' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ example: 'https://alexdev.io' })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ example: 'https://github.com/alexdev' })
  @IsString()
  @IsOptional()
  github?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/in/alexdev' })
  @IsString()
  @IsOptional()
  linkedin?: string;
}
