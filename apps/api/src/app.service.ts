import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealth() {
    if (!(await this.prisma.isDatabaseReady())) {
      throw new ServiceUnavailableException('Database is unavailable');
    }

    return {
      status: 'ok',
      service: 'NexusNation API',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
