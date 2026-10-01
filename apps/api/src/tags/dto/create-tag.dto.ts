import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'Rate Limiting' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'rate-limiting' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiPropertyOptional({ example: 'Techniques for controlling traffic rate, token bucket, leaky bucket algorithms.' })
  @IsString()
  @IsOptional()
  description?: string;
}
