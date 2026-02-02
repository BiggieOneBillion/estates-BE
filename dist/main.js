"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const redis_io_adapter_1 = require("./common/adapters/redis-io.adapter");
const bull_board_config_1 = require("./common/events/bull-board.config");
async function bootstrap() {
    console.log('Starting NestFactory.create...');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    console.log('NestFactory.create completed');
    const configService = app.get(config_1.ConfigService);
    const redisIoAdapter = new redis_io_adapter_1.RedisIoAdapter(app);
    try {
        console.log('Connecting to Redis...');
        await redisIoAdapter.connectToRedis();
        app.useWebSocketAdapter(redisIoAdapter);
        console.log('Redis connected successfully');
    }
    catch (error) {
        console.error('Fatal: Could not connect to Redis. Application exiting.');
        process.exit(1);
    }
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        allowedHeaders: 'Content-Type, Accept, Authorization',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        disableErrorMessages: false,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter(), new http_exception_filter_1.AllExceptionsFilter());
    (0, bull_board_config_1.setupBullBoard)(app);
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Estate Management System API')
        .setDescription('API documentation for the Estate Management System')
        .setVersion('1.0')
        .addServer('/api')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    app.setGlobalPrefix('api');
    const port = configService.get('PORT') || 3000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`API Documentation: http://localhost:${port}/api/docs`);
    console.log(`Queue Monitoring: http://localhost:${port}/admin/queues`);
}
bootstrap();
//# sourceMappingURL=main.js.map