import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private configService;
    private transporter;
    constructor(configService: ConfigService);
    private createDevTransport;
    sendVerificationEmail(to: string, code: string, name: string): Promise<any>;
}
