import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@nexus/types';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const req = context.switchToHttp().getRequest();
    const url = req?.url || '';

    return next.handle().pipe(
      map((data) => {
        // Bypass JSON wrapping for raw plain text endpoints like ads.txt or robots.txt
        if (typeof data === 'string' && (url.includes('ads-txt') || url.includes('ads.txt') || url.includes('robots.txt'))) {
          return data;
        }

        // If data is already an ApiResponse formatted structure
        if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
          return data;
        }

        // Handle paginated responses with meta
        if (data && typeof data === 'object' && 'items' in data && 'meta' in data) {
          return {
            success: true,
            data: data.items,
            meta: data.meta,
          };
        }

        return {
          success: true,
          data,
        };
      }),
    );
  }
}
