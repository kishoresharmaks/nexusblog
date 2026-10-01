import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TechnologiesService } from './technologies.service';
import { CreateTechnologyDto } from './dto/create-technology.dto';
import { UpdateTechnologyDto } from './dto/update-technology.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Technologies')
@Controller('technologies')
export class TechnologiesController {
  constructor(private readonly technologiesService: TechnologiesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all technologies with published article counts' })
  findAll() {
    return this.technologiesService.findAll();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get technology details by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.technologiesService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a new technology (Admin/Editor)' })
  create(@Body() dto: CreateTechnologyDto) {
    return this.technologiesService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'EDITOR')
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update a technology by ID (Admin/Editor)' })
  update(@Param('id') id: string, @Body() dto: UpdateTechnologyDto) {
    return this.technologiesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a technology by ID (Admin only)' })
  delete(@Param('id') id: string) {
    return this.technologiesService.delete(id);
  }
}
