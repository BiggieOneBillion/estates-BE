import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private configService;
    private transporter;
    constructor(configService: ConfigService);
    private createDevTransport;
    sendVerificationEmail(to: string, code: string, name: string): Promise<any>;
    accountCreationEmail(data: {
        to: string;
        name: string;
        password: string;
    }): Promise<any>;
    sendPasswordResetEmail(to: string, code: string, name: string): Promise<any>;
    sendPaymentReminder(data: {
        to: string;
        userName: string;
        levyTitle: string;
        amount: number;
        dueDate: Date;
        timeframe: string;
        isOverdue: boolean;
    }): Promise<any>;
    sendBasicEmail(to: string, subject: string, message: string): Promise<any>;
}
