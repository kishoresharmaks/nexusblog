import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env files from apps/api and root directory before reading process.env
const envFiles = ['.env.local', '.env'];
const searchDirs = [
  process.cwd(),
  path.resolve(process.cwd(), 'apps/api'),
  path.resolve(__dirname, '..'),
  path.resolve(__dirname, '../../..'),
];

for (const dir of searchDirs) {
  for (const file of envFiles) {
    const full = path.join(dir, file);
    dotenv.config({ path: full });
  }
}
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('NexusAPI');
  const app = await NestFactory.create(AppModule);

  const clientUrl = process.env.CLIENT_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://nexusnation.in';
  const port = Number(process.env.PORT || process.env.API_PORT || 4000);

  // Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Cookie Parser
  app.use(cookieParser());

  // CORS Configuration
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with any origin (localhost, 127.0.0.1, custom dev ports, etc.)
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  });

  // Global Prefix
  app.setGlobalPrefix('api');

  // Global Pipes & Interceptors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  // OpenAPI / Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('NexusBlog Technical Publishing API')
    .setDescription('REST API for technical publishing portal, user management, MDX content, and admin CMS')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addCookieAuth('refreshToken')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  logger.log(`🚀 NexusBlog API listening on http://localhost:${port}/api`);
  logger.log(`📚 Swagger Documentation available at http://localhost:${port}/api/docs`);
}

bootstrap();
