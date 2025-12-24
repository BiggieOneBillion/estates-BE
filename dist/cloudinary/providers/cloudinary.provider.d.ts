import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
export declare const CloudinaryProvider: {
    provide: string;
    inject: (typeof ConfigService)[];
    useFactory: (configService: ConfigService) => typeof cloudinary;
};
