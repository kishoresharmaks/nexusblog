import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { SystemSettingsModule } from '../system-settings/system-settings.module';
import { IndexNowModule } from '../indexnow/indexnow.module';
import { IncidentsController } from './incidents.controller';
import { IncidentSourcesService } from './incident-sources.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [SystemSettingsModule, IndexNowModule, MailModule],
  controllers: [ArticlesController, IncidentsController],
  providers: [ArticlesService, IncidentSourcesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
