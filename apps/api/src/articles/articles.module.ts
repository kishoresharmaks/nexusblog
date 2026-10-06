import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { SystemSettingsModule } from '../system-settings/system-settings.module';
import { IndexNowModule } from '../indexnow/indexnow.module';

@Module({
  imports: [SystemSettingsModule, IndexNowModule],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
