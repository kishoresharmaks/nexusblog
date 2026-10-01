import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || 'unknown';
    const correlationId = req.correlationId || 'none';
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const statusCode = res.statusCode;
          const duration = Date.now() - now;
          this.logger.log(
            JSON.stringify({
              level: 'info',
              timestamp: new Date().toISOString(),
              correlationId,
              method,
              path: originalUrl,
              statusCode,
              durationMs: duration,
              ip,
              userAgent,
            }),
          );
        },
        error: (error) => {
          const duration = Date.now() - now;
          const status = error?.status || error?.statusCode || 500;
          const logPayload = JSON.stringify({
            level: status >= 500 ? 'error' : 'warn',
            timestamp: new Date().toISOString(),
            correlationId,
            method,
            path: originalUrl,
            statusCode: status,
            durationMs: duration,
            errorName: error?.name || 'Error',
            errorMessage: error?.message || 'Unknown error',
            ip,
            userAgent,
          });

          if (status >= 500) {
            this.logger.error(logPayload);
          } else {
            this.logger.warn(logPayload);
          }
        },
      }),
    );
  }
}
