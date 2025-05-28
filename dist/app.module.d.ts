import { OnModuleInit } from '@nestjs/common';
import { InitialSeedService } from './common/seeders/initial-seeds';
export declare class AppModule implements OnModuleInit {
    private readonly initialSeedService;
    constructor(initialSeedService: InitialSeedService);
    onModuleInit(): Promise<void>;
}
