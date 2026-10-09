import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { IncidentDomain, IncidentFailureMode, IncidentImpact, IncidentSeverity } from '@prisma/client';

export class QueryIncidentDto {
  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit = 20;

  @ApiPropertyOptional({ enum: IncidentDomain })
  @IsEnum(IncidentDomain)
  @IsOptional()
  domain?: IncidentDomain;

  @ApiPropertyOptional({ enum: IncidentFailureMode })
  @IsEnum(IncidentFailureMode)
  @IsOptional()
  failureMode?: IncidentFailureMode;

  @ApiPropertyOptional({ enum: IncidentSeverity })
  @IsEnum(IncidentSeverity)
  @IsOptional()
  severity?: IncidentSeverity;

  @ApiPropertyOptional({ enum: IncidentImpact })
  @IsEnum(IncidentImpact)
  @IsOptional()
  impact?: IncidentImpact;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;
}
