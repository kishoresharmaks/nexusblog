import { PartialType } from '@nestjs/swagger';
import { CreateGuestPostDto } from './create-guest-post.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGuestPostDto extends PartialType(CreateGuestPostDto) {
  @ApiPropertyOptional({ description: 'Resubmit for review if revisions were requested' })
  @IsOptional()
  @IsBoolean()
  resubmit?: boolean;
}
