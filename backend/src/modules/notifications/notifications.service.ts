import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationsService {
  constructor(@InjectQueue('notifications') private readonly notificationsQueue: Queue) {}

  async sendSms(phoneNumber: string, message: string) {
    return this.notificationsQueue.add('send-sms', { phoneNumber, message });
  }

  async sendEmail(email: string, subject: string, body: string) {
    return this.notificationsQueue.add('send-email', { email, subject, body });
  }
}
