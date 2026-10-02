import { Controller, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('sms')
  sendSms(@Body() body: { phoneNumber: string; message: string }) {
    return this.notificationsService.sendSms(body.phoneNumber, body.message);
  }

  @Post('email')
  sendEmail(@Body() body: { email: string; subject: string; content: string }) {
    return this.notificationsService.sendEmail(body.email, body.subject, body.content);
  }
}
