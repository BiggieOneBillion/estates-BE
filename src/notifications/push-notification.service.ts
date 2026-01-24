import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private firebaseApp: admin.app.App;

  constructor(private configService: ConfigService) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      const serviceAccount = this.configService.get('FIREBASE_SERVICE_ACCOUNT');
      
      if (!serviceAccount) {
        this.logger.warn('Firebase service account not configured. Push notifications will be disabled.');
        return;
      }

      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
      });

      this.logger.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize Firebase: ${error.message}`);
    }
  }

  async sendToDevice(
    fcmToken: string,
    notification: {
      title: string;
      body: string;
    },
    data?: Record<string, string>,
  ): Promise<boolean> {
    if (!this.firebaseApp) {
      this.logger.warn('Firebase not initialized. Skipping push notification.');
      return false;
    }

    try {
      const message: admin.messaging.Message = {
        notification,
        data,
        token: fcmToken,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'estate_notifications',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Push notification sent successfully: ${response}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
      return false;
    }
  }

  async sendToMultipleDevices(
    fcmTokens: string[],
    notification: {
      title: string;
      body: string;
    },
    data?: Record<string, string>,
  ): Promise<number> {
    if (!this.firebaseApp || fcmTokens.length === 0) {
      return 0;
    }

    try {
      const message: admin.messaging.MulticastMessage = {
        notification,
        data,
        tokens: fcmTokens,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'estate_notifications',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      this.logger.log(`Push notifications sent: ${response.successCount}/${fcmTokens.length}`);
      
      // Log failed tokens for cleanup
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            this.logger.warn(`Failed to send to token ${fcmTokens[idx]}: ${resp.error?.message}`);
          }
        });
      }

      return response.successCount;
    } catch (error) {
      this.logger.error(`Failed to send multicast push notification: ${error.message}`);
      return 0;
    }
  }

  async sendToTopic(
    topic: string,
    notification: {
      title: string;
      body: string;
    },
    data?: Record<string, string>,
  ): Promise<boolean> {
    if (!this.firebaseApp) {
      return false;
    }

    try {
      const message: admin.messaging.Message = {
        notification,
        data,
        topic,
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Topic notification sent successfully: ${response}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send topic notification: ${error.message}`);
      return false;
    }
  }

  async subscribeToTopic(fcmTokens: string[], topic: string): Promise<void> {
    if (!this.firebaseApp) {
      return;
    }

    try {
      await admin.messaging().subscribeToTopic(fcmTokens, topic);
      this.logger.log(`Subscribed ${fcmTokens.length} devices to topic: ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to subscribe to topic: ${error.message}`);
    }
  }

  async unsubscribeFromTopic(fcmTokens: string[], topic: string): Promise<void> {
    if (!this.firebaseApp) {
      return;
    }

    try {
      await admin.messaging().unsubscribeFromTopic(fcmTokens, topic);
      this.logger.log(`Unsubscribed ${fcmTokens.length} devices from topic: ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to unsubscribe from topic: ${error.message}`);
    }
  }
}
