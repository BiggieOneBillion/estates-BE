import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationType } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const newNotification = new this.notificationModel(createNotificationDto);
    return newNotification.save();
  }

  async createTokenNotification(
    userId: string,
    tokenId: string,
    tokenValue: string,
    type: NotificationType,
    isVisitorIdVerified?: boolean,
  ): Promise<Notification> {
    let message = '';

    switch (type) {
      case NotificationType.VERIFY_VISTOR:
        message = `Please verify the visitor id with this token ${tokenValue}`;
        break;

      case NotificationType.VISITOR_VERIFIED:
        message = `Visitor has been verify for this token ${tokenValue}`;
        break;
      case NotificationType.TOKEN_UPDATED:
        if (isVisitorIdVerified) {
          message = `Please verify the visitor id with this token ${tokenValue}`;
        } else {
          message = `Your token ${tokenValue} has been updated`;
        }
        break;
      case NotificationType.TOKEN_VERIFIED:
        message = `Your token ${tokenValue} has been verified`;
        break;
      case NotificationType.TOKEN_EXPIRED:
        message = `Your token ${tokenValue} has expired`;
        break;
    }

    const notification = {
      user: userId,
      type,
      message,
      data: { tokenId, tokenValue },
      read: false,
    };

    return this.create(notification);
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationModel.find().exec();
  }

  async findAllByUser(userId: string): Promise<Notification[]> {
    return this.notificationModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findUnreadByUser(userId: string): Promise<Notification[]> {
    return this.notificationModel
      .find({ user: userId, read: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  async markAsRead(id: string): Promise<Notification | null> {
    const updatedNotification = await this.notificationModel
      .findByIdAndUpdate(id, { read: true, readAt: new Date() }, { new: true })
      .exec();

    if (!updatedNotification) {
      throw new NotFoundException('Notification not found');
    }

    return updatedNotification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel
      .updateMany(
        { user: userId, read: false },
        { read: true, readAt: new Date() },
      )
      .exec();
  }
}
