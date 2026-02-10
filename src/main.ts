// src/main.ts (updated)
// import './tracing';
import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  HttpExceptionFilter,
  AllExceptionsFilter,
} from './common/filters/http-exception.filter';
import { RedisIoAdapter } from './common/adapters/redis-io.adapter';
import { setupBullBoard } from './common/events/bull-board.config';

async function bootstrap() {
  console.log('Starting NestFactory.create...');
  const app = await NestFactory.create(AppModule);
  console.log('NestFactory.create completed');
  const configService = app.get(ConfigService);

  const redisIoAdapter = new RedisIoAdapter(app);
  try {
    console.log('Connecting to Redis...');
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Fatal: Could not connect to Redis. Application exiting.');
    process.exit(1);
  }

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: false,
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter(), new AllExceptionsFilter());

  // Setup BullBoard for queue monitoring
  setupBullBoard(app);

  // Swagger/OpenAPI documentation
  const config = new DocumentBuilder()
    .setTitle('Estate Management System API')
    .setDescription('API documentation for the Estate Management System')
    .setVersion('1.0')
    .addServer('/api')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'swagger.json',
    customJs: 'https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js',
    customCssUrl: 'https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css',
  });

    // Prefix all routes with /api
  app.setGlobalPrefix('api');

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`API Documentation: http://localhost:${port}/api/docs`);
  console.log(`Queue Monitoring: http://localhost:${port}/admin/queues`);
}
bootstrap();
