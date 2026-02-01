import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);
  private paystack: any;

  constructor(private configService: ConfigService) {
    try {
      const secretKey = this.configService.get('PAYSTACK_SECRET_KEY');
      if (secretKey) {
        this.paystack = require('paystack')(secretKey);
        this.logger.log('Paystack initialized successfully');
      } else {
        this.logger.warn('Paystack secret key not found. Payment integration disabled.');
      }
    } catch (error) {
      this.logger.error(`Failed to initialize Paystack: ${error.message}`);
    }
  }

  async initializePayment(params: {
    email: string;
    amount: number;
    reference: string;
    metadata?: any;
  }): Promise<{
    authorizationUrl: string;
    accessCode: string;
    reference: string;
  }> {
    if (!this.paystack) {
      throw new Error('Paystack is not configured');
    }

    try {
      const response = await this.paystack.transaction.initialize({
        email: params.email,
        amount: params.amount * 100, // Convert to kobo (Paystack uses smallest currency unit)
        reference: params.reference,
        metadata: params.metadata,
        callback_url: this.configService.get('PAYSTACK_CALLBACK_URL'),
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
      });

      this.logger.log(`Payment initialized for ${params.email}: ${params.reference}`);

      return {
        authorizationUrl: response.data.authorization_url,
        accessCode: response.data.access_code,
        reference: response.data.reference,
      };
    } catch (error) {
      this.logger.error(`Payment initialization failed: ${error.message}`);
      throw error;
    }
  }

  async verifyPayment(reference: string): Promise<any> {
    if (!this.paystack) {
      throw new Error('Paystack is not configured');
    }

    try {
      const response = await this.paystack.transaction.verify(reference);
      this.logger.log(`Payment verified: ${reference} - Status: ${response.data.status}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Payment verification failed: ${error.message}`);
      throw error;
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const secretKey = this.configService.get('PAYSTACK_SECRET_KEY');
    if (!secretKey) {
      return false;
    }

    const hash = crypto
      .createHmac('sha512', secretKey)
      .update(payload)
      .digest('hex');

    return hash === signature;
  }

  async getTransaction(transactionId: string): Promise<any> {
    if (!this.paystack) {
      throw new Error('Paystack is not configured');
    }

    try {
      const response = await this.paystack.transaction.get(transactionId);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get transaction: ${error.message}`);
      throw error;
    }
  }
}
