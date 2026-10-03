import { PartialType } from '@nestjs/swagger';
import { CreateAdPlacementDto } from './create-ad-placement.dto';

export class UpdateAdPlacementDto extends PartialType(CreateAdPlacementDto) {}
