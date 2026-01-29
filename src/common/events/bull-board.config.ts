// src/common/events/bull-board.config.ts
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export function setupBullBoard(app: INestApplication) {
  const configService = app.get(ConfigService);

  // Create the queue instance for monitoring
  const outboxQueue = new Queue('outbox-processor', {
    connection: {
      host: configService.get('REDIS_HOST', 'localhost'),
      port: configService.get('REDIS_PORT', 6379),
    },
  });

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  createBullBoard({
    queues: [new BullMQAdapter(outboxQueue)],
    serverAdapter: serverAdapter,
  });

  // Mount the BullBoard UI
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use('/admin/queues', serverAdapter.getRouter());

  console.log('🎯 BullBoard UI available at: http://localhost:3000/admin/queues');
}
