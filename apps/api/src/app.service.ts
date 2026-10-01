import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'NexusBlog API',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
