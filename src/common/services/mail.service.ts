import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor(private configService: ConfigService) {
    // Check if we're in development mode
    const isDev = this.configService.get('NODE_ENV') !== 'production';

    if (isDev) {
      // Use Ethereal for development
      this.createDevTransport();
    } else {
      // Use Gmail for production
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: this.configService.get('EMAIL_USER'),
          pass: this.configService.get('EMAIL_PASSWORD'),
        },
      });
    }
  }

  private async createDevTransport() {
    // Create a test account on Ethereal
    const testAccount = await nodemailer.createTestAccount();

    // Create a transporter using Ethereal credentials
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    console.log('Ethereal Email credentials:', {
      user: testAccount.user,
      pass: testAccount.pass,
      preview: nodemailer.getTestMessageUrl,
    });
  }

  async sendVerificationEmail(to: string, code: string, name: string) {
    const mailOptions = {
      from: '"Estate Management" <noreply@estatemanagement.com>',
      to,
      subject: 'Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${name},</h2>
          <p>Thank you for registering with Estate Management. Please verify your email address to complete your registration.</p>
          <p>Your verification code is: <strong>${code}</strong></p>
          <p>This code will expire in 24 hours.</p>
          <p>If you did not request this verification, please ignore this email.</p>
          <p>Best regards,<br>Estate Management Team</p>
        </div>
      `,
    };

    const info = await this.transporter.sendMail(mailOptions);

    // If using Ethereal in development, log the preview URL
    if (this.configService.get('NODE_ENV') !== 'production') {
      console.log('Email preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return info;
  }

  async accountCreationEmail(data: {
    to: string;
    name: string;
    password: string;
  }) {
    const mailOptions = {
      from: '"Estate Management" <noreply@estatemanagement.com>',
      to: data.to,
      subject: 'Account Creation Details',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${data.name},</h2>
          <p>Your account has been created successfully.</p>
          <p>Your password is: ${data.password}</strong></p>
          <p>Please change your password after your first login.</p>
          <p>If you are unaware of this account creation, please ignore this email.</p>
          <p>Best regards,<br>Estate Management Team</p>
        </div>
      `,
    };

    const info = await this.transporter.sendMail(mailOptions);

    // If using Ethereal in development, log the preview URL
    if (this.configService.get('NODE_ENV') !== 'production') {
      console.log('Email preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return info;
  }

  async sendPasswordResetEmail(to: string, code: string, name: string) {
    const mailOptions = {
      from: '"Estate Management" <noreply@estatemanagement.com>',
      to,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${name},</h2>
          <p>We received a request to reset your password. Please use the following code to reset your password:</p>
          <p>Your password reset code is: <strong>${code}</strong></p>
          <p>This code will expire in 15 minutes.</p>
          <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
          <p>Best regards,<br>Estate Management Team</p>
        </div>
      `,
    };

    const info = await this.transporter.sendMail(mailOptions);

    // If using Ethereal in development, log the preview URL
    if (this.configService.get('NODE_ENV') !== 'production') {
      console.log('Email preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return info;
  }

  
}
