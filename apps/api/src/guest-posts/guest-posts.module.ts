import { Module } from '@nestjs/common';
import { GuestPostsController } from './guest-posts.controller';
import { GuestPostsService } from './guest-posts.service';

@Module({
  controllers: [GuestPostsController],
  providers: [GuestPostsService],
  exports: [GuestPostsService],
})
export class GuestPostsModule {}
