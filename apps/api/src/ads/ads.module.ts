import { Module } from '@nestjs/common';
import { AdsController, AdsTrackingRateLimitGuard } from './ads.controller';
import { AdsService } from './ads.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdsController],
  providers: [AdsService, AdsTrackingRateLimitGuard],
  exports: [AdsService],
})
export class AdsModule {}
