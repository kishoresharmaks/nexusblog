import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { ArticlesService } from './articles.service';
import { QueryIncidentDto } from './dto/query-incident.dto';

@ApiTags('Incidents')
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Browse published engineering incidents' })
  list(@Query() query: QueryIncidentDto) {
    return this.articlesService.findPublicIncidents(query);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get a published incident and its sourced timeline' })
  detail(@Param('slug') slug: string) {
    return this.articlesService.findPublicBySlug(slug, undefined, 'INCIDENT');
  }
}
