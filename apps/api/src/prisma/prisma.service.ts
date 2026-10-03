import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const dbUrl = (process.env.DATABASE_URL || 'mongodb+srv://krishkishoreks_db_user:QzybimkqcbeYFMEA@cluster0.u3idvmr.mongodb.net/nexusblog?retryWrites=true&w=majority&appName=Cluster0')
      .replace('NEH0AePPKevyWWNS', 'QzybimkqcbeYFMEA');
    super({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log(' Connected to MongoDB database successfully.');
    } catch (error) {
      this.logger.warn(`⚠️ MongoDB connection deferred or failed: ${(error as Error).message}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from database.');
  }
}
