import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { TechnologiesModule } from './technologies/technologies.module';
import { ArticleTypesModule } from './article-types/article-types.module';
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
import { MailModule } from './mail/mail.module';
import { SystemSettingsModule } from './system-settings/system-settings.module';
import { PagesModule } from './pages/pages.module';
import { OgModule } from './og/og.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AdsModule } from './ads/ads.module';
import { ShortenerModule } from './shortener/shortener.module';
import { IndexNowModule } from './indexnow/indexnow.module';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const configuredDir =
          configService.get<string>('STORAGE_LOCAL_DIR') || process.env.STORAGE_LOCAL_DIR;
        const rootPath = configuredDir
          ? path.isAbsolute(configuredDir)
            ? configuredDir
            : path.resolve(process.cwd(), configuredDir)
          : path.resolve(process.cwd(), '../../storage/local/media');

        return [
          {
            rootPath,
            serveRoot: '/uploads',
            serveStaticOptions: {
              setHeaders: (res: any) => {
                res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
                res.setHeader('Access-Control-Allow-Origin', '*');
              },
            },
          },
        ];
      },
    }),
    PrismaModule,
    MailModule,
    SystemSettingsModule,
    IndexNowModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    TagsModule,
    TechnologiesModule,
    ArticleTypesModule,
    SeriesModule,
    MediaModule,
    ArticlesModule,
    BookmarksModule,
    ReadingHistoryModule,
    CommentsModule,
    GuestPostsModule,
    AuditLogsModule,
    NewsletterModule,
    PagesModule,
    OgModule,
    AnalyticsModule,
    AdsModule,
    ShortenerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
