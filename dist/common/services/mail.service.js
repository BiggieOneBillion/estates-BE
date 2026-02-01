"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let MailService = class MailService {
    configService;
    transporter;
    constructor(configService) {
        this.configService = configService;
        const isDev = this.configService.get('NODE_ENV') !== 'production';
        if (isDev) {
            this.createDevTransport();
        }
        else {
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: this.configService.get('EMAIL_USER'),
                    pass: this.configService.get('EMAIL_PASSWORD'),
                },
            });
        }
    }
    async createDevTransport() {
        const testAccount = await nodemailer.createTestAccount();
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
    async sendVerificationEmail(to, code, name) {
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
        if (this.configService.get('NODE_ENV') !== 'production') {
            console.log('Email preview URL:', nodemailer.getTestMessageUrl(info));
        }
        return info;
    }
    async accountCreationEmail(data) {
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
        if (this.configService.get('NODE_ENV') !== 'production') {
            console.log('Email preview URL:', nodemailer.getTestMessageUrl(info));
        }
        return info;
    }
    async sendPasswordResetEmail(to, code, name) {
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
        if (this.configService.get('NODE_ENV') !== 'production') {
            console.log('Email preview URL:', nodemailer.getTestMessageUrl(info));
        }
        return info;
    }
    async sendPaymentReminder(data) {
        const subject = data.isOverdue
            ? `Payment Overdue: ${data.levyTitle}`
            : `Payment Reminder: ${data.levyTitle}`;
        const dueDateFormatted = data.dueDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        const urgencyColor = data.isOverdue ? '#dc2626' : '#f59e0b';
        const urgencyText = data.isOverdue ? 'OVERDUE' : 'REMINDER';
        const mailOptions = {
            from: '"Estate Management" <noreply@estatemanagement.com>',
            to: data.to,
            subject,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: ${urgencyColor}; color: white; padding: 10px; text-align: center; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">${urgencyText}</h2>
          </div>
          <div style="border: 1px solid #e5e7eb; border-top: none; padding: 20px; border-radius: 0 0 5px 5px;">
            <h3>Hello ${data.userName},</h3>
            ${data.isOverdue
                ? `<p style="color: #dc2626; font-weight: bold;">Your payment is overdue. Please make payment as soon as possible to avoid restrictions.</p>`
                : `<p>This is a friendly reminder about your upcoming payment.</p>`}
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Levy:</strong> ${data.levyTitle}</p>
              <p style="margin: 5px 0;"><strong>Amount:</strong> ₦${data.amount.toLocaleString()}</p>
              <p style="margin: 5px 0;"><strong>Due Date:</strong> ${dueDateFormatted}</p>
              ${!data.isOverdue
                ? `<p style="margin: 5px 0;"><strong>Time Remaining:</strong> ${data.timeframe === 'today' ? 'Due Today' : data.timeframe}</p>`
                : ''}
            </div>
            ${data.isOverdue
                ? `<p style="color: #dc2626;">Please make your payment immediately to avoid any service restrictions or penalties.</p>`
                : `<p>Please ensure you make your payment on or before the due date.</p>`}
            <p>If you have already made this payment, please disregard this reminder.</p>
            <p style="margin-top: 30px;">Best regards,<br>Estate Management Team</p>
          </div>
        </div>
      `,
        };
        const info = await this.transporter.sendMail(mailOptions);
        if (this.configService.get('NODE_ENV') !== 'production') {
            console.log('Payment reminder email preview URL:', nodemailer.getTestMessageUrl(info));
        }
        return info;
    }
    async sendBasicEmail(to, subject, message) {
        const mailOptions = {
            from: '"Estate Management" <noreply@estatemanagement.com>',
            to,
            subject,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="border: 1px solid #e5e7eb; padding: 20px; border-radius: 5px;">
            <h3>Security Notification</h3>
            <p>${message}</p>
            <p style="margin-top: 30px;">Best regards,<br>Estate Management Team</p>
          </div>
        </div>
      `,
        };
        const info = await this.transporter.sendMail(mailOptions);
        if (this.configService.get('NODE_ENV') !== 'production') {
            console.log('Basic email preview URL:', nodemailer.getTestMessageUrl(info));
        }
        return info;
    }
};
exports.MailService = MailService;
exports.MailService = MailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map