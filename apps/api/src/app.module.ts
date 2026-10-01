import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { TechnologiesModule } from './technologies/technologies.module';
import { SeriesModule } from './series/series.module';
import { MediaModule } from './media/media.module';
import { ArticlesModule } from './articles/articles.module';
import { UsersModule } from './users/users.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { ReadingHistoryModule } from './reading-history/reading-history.module';
import { CommentsModule } from './comments/comments.module';
import { GuestPostsModule } from './guest-posts/guest-posts.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { NewsletterModule } from './newsletter/newsletter.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(process.cwd(), '../../storage/local/media'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    TagsModule,
    TechnologiesModule,
    SeriesModule,
    MediaModule,
    ArticlesModule,
    BookmarksModule,
    ReadingHistoryModule,
    CommentsModule,
    GuestPostsModule,
    AuditLogsModule,
    NewsletterModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
