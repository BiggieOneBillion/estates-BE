import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';
export declare class DatabaseConfig {
    private configService;
    constructor(configService: ConfigService);
    getMongoConfig(): MongooseModuleOptions;
}
