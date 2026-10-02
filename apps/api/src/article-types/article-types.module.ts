import { Module } from '@nestjs/common';
import { ArticleTypesController } from './article-types.controller';
import { ArticleTypesService } from './article-types.service';

@Module({
  controllers: [ArticleTypesController],
  providers: [ArticleTypesService],
  exports: [ArticleTypesService],
})
export class ArticleTypesModule {}
