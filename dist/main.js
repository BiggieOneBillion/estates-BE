"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const redis_io_adapter_1 = require("./common/adapters/redis-io.adapter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const redisIoAdapter = new redis_io_adapter_1.RedisIoAdapter(app);
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);
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
        exceptionFactory: (errors) => {
            console.log('Main Errors', errors);
            const formattedErrors = errors.reduce((acc, error) => {
                acc[error.property] = error.constraints
                    ? Object.values(error.constraints).join(', ')
                    : '';
                return acc;
            }, {});
            return new common_1.BadRequestException({
                message: 'Validation failed',
                errors: formattedErrors,
            });
        },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter(), new http_exception_filter_1.AllExceptionsFilter());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Estate Management System API')
        .setDescription('API documentation for the Estate Management System')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    app.setGlobalPrefix('api');
    const port = configService.get('PORT') || 3000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map