import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LeviesService } from '../levies/levies.service';
import { PaymentsService } from '../payments/payments.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../common/services/mail.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PushNotificationService } from '../notifications/push-notification.service';
import { ObjectId } from 'mongoose';

@Injectable()
export class PaymentReminderService {
  private readonly logger = new Logger(PaymentReminderService.name);

  constructor(
    private readonly leviesService: LeviesService,
    private readonly paymentsService: PaymentsService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly eventEmitter: EventEmitter2,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendDailyReminders() {
    this.logger.log('Running daily payment reminders...');

    try {
      await this.send7DayReminders();
      await this.send3DayReminders();
      await this.sendDueDateReminders();
      await this.sendOverdueNotices();
      
      this.logger.log('Daily payment reminders completed');
    } catch (error) {
      this.logger.error(`Error sending daily reminders: ${error.message}`);
    }
  }

  private async send7DayReminders() {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);

    await this.sendRemindersForDate(targetDate, '7 days');
  }

  private async send3DayReminders() {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);

    await this.sendRemindersForDate(targetDate, '3 days');
  }

  private async sendDueDateReminders() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.sendRemindersForDate(today, 'today');
  }

  private async sendOverdueNotices() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await this.sendRemindersForDate(yesterday, 'overdue', true);
  }

  private async sendRemindersForDate(
    targetDate: Date,
    timeframe: string,
    isOverdue: boolean = false,
  ) {
    // Get all active levies due on target date
    const levies = await this.leviesService.findLeviesDueOn(targetDate);

    for (const levy of levies) {
      // Get all users who should pay this levy
      const applicableUsers = await this.usersService.findByEstateAndRoles(
        levy.estateId.toString(),
        levy.applicableRoles,
      );

      for (const user of applicableUsers) {
        // Check if user has already paid
        const hasPaid = await this.paymentsService.hasUserPaidLevy(
          (user._id as ObjectId).toString(),
          (levy._id as ObjectId).toString(),
        );

        if (!hasPaid) {
          await this.sendReminder(user, levy, timeframe, isOverdue);
        }
      }
    }
  }

  private async sendReminder(user: any, levy: any, timeframe: string, isOverdue: boolean) {
    try {
      const subject = isOverdue
        ? `Payment Overdue: ${levy.title}`
        : `Payment Reminder: ${levy.title}`;

      const message = isOverdue
        ? `Your payment for "${levy.title}" was due on ${levy.dueDate.toLocaleDateString()}. Please make payment as soon as possible to avoid restrictions.`
        : `Reminder: Your payment for "${levy.title}" is due ${timeframe === 'today' ? 'today' : `in ${timeframe}`}.`;

      // Send email
      await this.mailService.sendPaymentReminder({
        to: user.email,
        userName: user.firstName,
        levyTitle: levy.title,
        amount: levy.amount,
        dueDate: levy.dueDate,
        timeframe,
        isOverdue,
      });

      // Send push notification
      if (user.fcmTokens && user.fcmTokens.length > 0) {
        await this.pushNotificationService.sendToMultipleDevices(
          user.fcmTokens,
          {
            title: subject,
            body: message,
          },
          {
            type: 'payment_reminder',
            levyId: levy._id.toString(),
            isOverdue: isOverdue.toString(),
          },
        );
      }

      this.logger.log(`Sent ${timeframe} reminder to ${user.email} for levy ${levy.title}`);
    } catch (error) {
      this.logger.error(`Failed to send reminder to ${user.email}: ${error.message}`);
    }
  }
}
