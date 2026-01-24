import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DomainEvents, TokenEvent } from '../common/events/domain-events';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsService } from './events.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { PushNotificationService } from '../notifications/push-notification.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class EventsListener {
  private readonly logger = new Logger(EventsListener.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly eventsService: EventsService,
    private readonly pushNotificationService: PushNotificationService,
    private readonly usersService: UsersService,
  ) {}

  @OnEvent(DomainEvents.VISITOR_VERIFIED)
  async handleVisitorVerified(event: TokenEvent) {
    this.logger.log(`Handling VISITOR_VERIFIED event for token ${event.tokenValue}`);
    
    const { userId, tokenId, tokenValue, payload } = event;
    const securityId = payload.securityId;

    // 1. Create notification for token owner
    await this.notificationsService.createTokenNotification(
      userId,
      tokenId,
      tokenValue,
      NotificationType.VISITOR_VERIFIED,
    );

    // 2. Notify token owner via WebSocket
    this.eventsService.sendToUser(userId, 'visitor_verified', {
      tokenId,
      token: tokenValue,
      type: NotificationType.VISITOR_VERIFIED,
      timestamp: new Date(),
    });

    // 3. Notify security personnel via WebSocket
    if (securityId) {
      this.eventsService.sendToUser(securityId, 'visitor_verified', {
        tokenId,
        token: tokenValue,
        type: NotificationType.VISITOR_VERIFIED,
        timestamp: new Date(),
      });
    }

    // 4. Send push notification to token owner
    await this.sendPushNotification(userId, {
      title: 'Visitor Verified',
      body: `Your visitor with token ${tokenValue} has been verified`,
    }, { tokenId, type: 'visitor_verified' });
  }

  @OnEvent(DomainEvents.TOKEN_VERIFIED)
  async handleTokenVerified(event: TokenEvent) {
    this.logger.log(`Handling TOKEN_VERIFIED event for token ${event.tokenValue}`);
    
    const { userId, tokenId, tokenValue } = event;

    // 1. Create notification for token owner
    await this.notificationsService.createTokenNotification(
      userId,
      tokenId,
      tokenValue,
      NotificationType.TOKEN_VERIFIED,
    );

    // 2. Notify token owner via WebSocket
    this.eventsService.sendToUser(userId, 'token_verified', {
      tokenId,
      token: tokenValue,
      type: NotificationType.TOKEN_VERIFIED,
      timestamp: new Date(),
    });

    // 3. Send push notification
    await this.sendPushNotification(userId, {
      title: 'Gate Pass Verified',
      body: `Your gate pass ${tokenValue} has been verified by security`,
    }, { tokenId, type: 'token_verified' });
  }

  @OnEvent(DomainEvents.VISITOR_REJECTED)
  async handleVisitorRejected(event: TokenEvent) {
    this.logger.log(`Handling VISITOR_REJECTED event for token ${event.tokenValue}`);
    
    const { userId, tokenId, tokenValue, payload } = event;
    const securityId = payload.securityId;

    // Batch DB notifications
    await Promise.all([
      this.notificationsService.createTokenNotification(
        userId,
        tokenId,
        tokenValue,
        NotificationType.TOKEN_UPDATED,
        true,
      ),
      securityId ? this.notificationsService.createTokenNotification(
        securityId,
        tokenId,
        tokenValue,
        NotificationType.TOKEN_UPDATED,
        true,
      ) : Promise.resolve(),
    ]);

    // Notify security via WebSocket
    if (securityId) {
      this.eventsService.sendToUser(securityId, 'visitor_rejected', {
        tokenId,
        token: tokenValue,
        type: NotificationType.TOKEN_UPDATED,
        timestamp: new Date(),
      });
    }
  }

  @OnEvent(DomainEvents.TOKEN_UPDATED)
  async handleTokenUpdated(event: TokenEvent) {
    this.logger.log(`Handling TOKEN_UPDATED event for token ${event.tokenValue}`);
    
    const { userId, tokenId, tokenValue, payload } = event;
    const isImage = payload?.isImage;
    
    const notificationType = isImage
      ? NotificationType.VERIFY_VISTOR
      : NotificationType.TOKEN_UPDATED;

    await this.notificationsService.createTokenNotification(
      userId,
      tokenId,
      tokenValue,
      notificationType,
      true,
    );

    this.eventsService.sendToUser(userId, 'user_updated', {
      tokenId,
      token: tokenValue,
      type: notificationType,
      timestamp: new Date(),
    });
  }

  private async sendPushNotification(
    userId: string,
    notification: { title: string; body: string },
    data?: Record<string, string>,
  ): Promise<void> {
    try {
      const user = await this.usersService.findOne(userId);
      
      // Check if user has push notifications enabled
      if (!user.notificationPreferences?.push) {
        this.logger.debug(`Push notifications disabled for user ${userId}`);
        return;
      }

      // Send to all registered devices
      if (user.fcmTokens && user.fcmTokens.length > 0) {
        await this.pushNotificationService.sendToMultipleDevices(
          user.fcmTokens,
          notification,
          data,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
    }
  }
}
