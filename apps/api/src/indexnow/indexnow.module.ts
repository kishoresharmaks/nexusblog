import { Module } from '@nestjs/common';
import { IndexNowService } from './indexnow.service';
import { SystemSettingsModule } from '../system-settings/system-settings.module';

@Module({
  imports: [SystemSettingsModule],
  providers: [IndexNowService],
  exports: [IndexNowService],
})
export class IndexNowModule {}
