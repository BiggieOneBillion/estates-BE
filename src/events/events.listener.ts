import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DomainEvents, TokenEvent } from '../common/events/domain-events';
import { NotificationsService } from '../notifications/notifications.service';
import { EventsService } from './events.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class EventsListener {
  private readonly logger = new Logger(EventsListener.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly eventsService: EventsService,
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
}
