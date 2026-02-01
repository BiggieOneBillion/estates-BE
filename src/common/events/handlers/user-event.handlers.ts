// src/common/events/handlers/user-event.handlers.ts
import { Injectable, Logger } from '@nestjs/common';
import { EventHandler } from '../interfaces/event-handler.interface';
import {
  UserCreatedEvent,
  UserVerifiedEvent,
  UserLoggedInEvent,
  UserPasswordResetRequestedEvent,
  UserPasswordResetCompletedEvent,
  UserVerificationEmailRequestedEvent,
  UserSecurityAlertEvent,
  UserAccountCreatedEvent,
} from '../domain/user-events';
import { MailService } from '../../services/mail.service';

@Injectable()
export class UserCreatedHandler implements EventHandler<UserCreatedEvent> {
  private readonly logger = new Logger(UserCreatedHandler.name);

  constructor(private readonly mailService: MailService) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    const payload = event.getPayload();

    this.logger.log(
      `Handling UserCreatedEvent for user ${payload.email} (ID: ${payload.userId})`,
    );

    try {
      await this.mailService.sendVerificationEmail(
        payload.email,
        payload.verificationToken,
        `${payload.firstName} ${payload.lastName}`,
      );

      this.logger.log(
        `Verification email sent successfully to ${payload.email}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${payload.email}: ${error.message}`,
        error.stack,
      );
      throw error; // Re-throw to trigger retry
    }
  }

  getEventType(): string {
    return 'user.created';
  }

  getHandlerName(): string {
    return 'UserCreatedHandler';
  }
}

@Injectable()
export class UserVerifiedHandler implements EventHandler<UserVerifiedEvent> {
  private readonly logger = new Logger(UserVerifiedHandler.name);

  constructor(private readonly mailService: MailService) {}

  async handle(event: UserVerifiedEvent): Promise<void> {
    const payload = event.getPayload();

    this.logger.log(
      `Handling UserVerifiedEvent for user ${payload.email} (ID: ${payload.userId})`,
    );

    try {
      // Send welcome email
      await this.mailService.sendBasicEmail(
        payload.email,
        'Welcome to Estate Management',
        `Your email has been verified successfully. Welcome to our platform!`,
      );

      this.logger.log(`Welcome email sent successfully to ${payload.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${payload.email}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  getEventType(): string {
    return 'user.verified';
  }

  getHandlerName(): string {
    return 'UserVerifiedHandler';
  }
}

@Injectable()
export class UserLoggedInHandler implements EventHandler<UserLoggedInEvent> {
  private readonly logger = new Logger(UserLoggedInHandler.name);

  constructor(private readonly mailService: MailService) {}

  async handle(event: UserLoggedInEvent): Promise<void> {
    const payload = event.getPayload();

    this.logger.log(
      `Handling UserLoggedInEvent for user ${payload.email} (ID: ${payload.userId})`,
    );

    try {
      // Send OTP email for login verification
      await this.mailService.sendVerificationEmail(
        payload.email,
        payload.verificationToken,
        `${payload.firstName} ${payload.lastName}`,
      );

      this.logger.log(`Login OTP email sent successfully to ${payload.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send login OTP email to ${payload.email}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  getEventType(): string {
    return 'user.logged_in';
  }

  getHandlerName(): string {
    return 'UserLoggedInHandler';
  }
}

@Injectable()
export class UserPasswordResetRequestedHandler
  implements EventHandler<UserPasswordResetRequestedEvent>
{
  private readonly logger = new Logger(UserPasswordResetRequestedHandler.name);

  constructor(private readonly mailService: MailService) {}

  async handle(event: UserPasswordResetRequestedEvent): Promise<void> {
    const payload = event.getPayload();

    this.logger.log(
      `Handling UserPasswordResetRequestedEvent for user ${payload.email} (ID: ${payload.userId})`,
    );

    try {
      // Send password reset email
      await this.mailService.sendPasswordResetEmail(
        payload.email,
        payload.resetToken,
        `${payload.firstName} ${payload.lastName}`,
      );

      this.logger.log(
        `Password reset email sent successfully to ${payload.email}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${payload.email}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  getEventType(): string {
    return 'user.password_reset_requested';
  }

  getHandlerName(): string {
    return 'UserPasswordResetRequestedHandler';
  }
}

@Injectable()
export class UserPasswordResetCompletedHandler
  implements EventHandler<UserPasswordResetCompletedEvent>
{
  private readonly logger = new Logger(UserPasswordResetCompletedHandler.name);

  constructor(private readonly mailService: MailService) {}

  async handle(event: UserPasswordResetCompletedEvent): Promise<void> {
    const payload = event.getPayload();

    this.logger.log(
      `Handling UserPasswordResetCompletedEvent for user ${payload.email} (ID: ${payload.userId})`,
    );

    try {
      // Send confirmation email
      await this.mailService.sendBasicEmail(
        payload.email,
        'Password Reset Successful',
        `Your password has been reset successfully. If you did not perform this action, please contact support immediately.`,
      );

      this.logger.log(
        `Password reset confirmation email sent successfully to ${payload.email}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send password reset confirmation email to ${payload.email}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  getEventType(): string {
    return 'user.password_reset_completed';
  }

  getHandlerName(): string {
    return 'UserPasswordResetCompletedHandler';
  }
}

@Injectable()
export class UserVerificationEmailRequestedHandler
  implements EventHandler<UserVerificationEmailRequestedEvent>
{
  private readonly logger = new Logger(UserVerificationEmailRequestedHandler.name);

  constructor(private readonly mailService: MailService) {}

  async handle(event: UserVerificationEmailRequestedEvent): Promise<void> {
    const payload = event.getPayload();

    this.logger.log(
      `Handling UserVerificationEmailRequestedEvent for user ${payload.email}`,
    );

    await this.mailService.sendVerificationEmail(
      payload.email,
      payload.verificationToken,
      `${payload.firstName} ${payload.lastName}`,
    );

    this.logger.log(`Verification email re-sent successfully to ${payload.email}`);
  }

  getEventType(): string {
    return 'user.verification_email_requested';
  }

  getHandlerName(): string {
    return 'UserVerificationEmailRequestedHandler';
  }
}

@Injectable()
export class UserSecurityAlertHandler
  implements EventHandler<UserSecurityAlertEvent>
{
  private readonly logger = new Logger(UserSecurityAlertHandler.name);

  constructor(private readonly mailService: MailService) {}

  async handle(event: UserSecurityAlertEvent): Promise<void> {
    const payload = event.getPayload();

    this.logger.log(`Handling UserSecurityAlertEvent for user ${payload.email}`);

    const subject =
      payload.alertType === 'device_switch'
        ? 'Security Alert: New Device Login'
        : 'Security Alert: Suspicious Activity';

    await this.mailService.sendBasicEmail(
      payload.email,
      subject,
      `Hello ${payload.firstName}, ${payload.details}`,
    );

    this.logger.log(`Security alert email sent successfully to ${payload.email}`);
  }

  getEventType(): string {
    return 'user.security_alert';
  }

  getHandlerName(): string {
    return 'UserSecurityAlertHandler';
  }
}

@Injectable()
export class UserAccountCreatedHandler
  implements EventHandler<UserAccountCreatedEvent>
{
  private readonly logger = new Logger(UserAccountCreatedHandler.name);

  constructor(private readonly mailService: MailService) {}

  async handle(event: UserAccountCreatedEvent): Promise<void> {
    const payload = event.getPayload();

    this.logger.log(
      `Handling UserAccountCreatedEvent for user ${payload.email}`,
    );

    try {
      await this.mailService.accountCreationEmail({
        to: payload.email,
        name: `${payload.firstName} ${payload.lastName}`,
        password: payload.password || '******', // Security: Mask if not present
      });

      this.logger.log(
        `Account creation email sent successfully to ${payload.email}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send account creation email to ${payload.email}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  getEventType(): string {
    return 'user.account_created';
  }

  getHandlerName(): string {
    return 'UserAccountCreatedHandler';
  }
}
