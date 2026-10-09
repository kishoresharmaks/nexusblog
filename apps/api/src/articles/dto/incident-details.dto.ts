import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  IncidentDatePrecision,
  IncidentDomain,
  IncidentFailureMode,
  IncidentImpact,
  IncidentSeverity,
  IncidentSourceType,
} from '@prisma/client';

export class IncidentSourceDto {
  @ApiProperty()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  url!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  publisher!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @ApiProperty({ enum: IncidentSourceType })
  @IsEnum(IncidentSourceType)
  sourceType!: IncidentSourceType;

  @ApiPropertyOptional({ description: 'Required when sourceType is APPROVED_EXCEPTION.' })
  @ValidateIf((source: IncidentSourceDto) => source.sourceType === IncidentSourceType.APPROVED_EXCEPTION)
  @IsString()
  @IsNotEmpty()
  exceptionReason?: string;
}

export class IncidentEventDto {
  @ApiProperty()
  @IsInt()
  @Min(0)
  order!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  occurredAt?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  dateLabel?: string;

  @ApiPropertyOptional({ example: 'UTC' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ enum: IncidentDatePrecision })
  @IsOptional()
  @IsEnum(IncidentDatePrecision)
  precision?: IncidentDatePrecision;

  @ApiProperty()
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({ type: [IncidentSourceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IncidentSourceDto)
  sources!: IncidentSourceDto[];
}

export class IncidentDetailsDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  organization?: string;

  @ApiProperty({ enum: IncidentDomain })
  @IsOptional()
  @IsEnum(IncidentDomain)
  domain?: IncidentDomain;

  @ApiProperty({ enum: IncidentFailureMode })
  @IsOptional()
  @IsEnum(IncidentFailureMode)
  failureMode?: IncidentFailureMode;

  @ApiProperty({ enum: IncidentSeverity })
  @IsOptional()
  @IsEnum(IncidentSeverity)
  severity?: IncidentSeverity;

  @ApiProperty({ enum: IncidentImpact, isArray: true })
  @IsArray()
  @IsOptional()
  @IsEnum(IncidentImpact, { each: true })
  impacts!: IncidentImpact[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endedAt?: string;

  @ApiProperty({ enum: IncidentDatePrecision })
  @IsOptional()
  @IsEnum(IncidentDatePrecision)
  datePrecision?: IncidentDatePrecision;

  @ApiProperty()
  @IsOptional()
  @IsString()
  detection?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  recovery?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  lessons?: string;

  @ApiProperty({ type: [IncidentEventDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IncidentEventDto)
  events!: IncidentEventDto[];

  @ApiPropertyOptional({ description: 'Required for each edit to a published incident.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  changeNote?: string;
}
