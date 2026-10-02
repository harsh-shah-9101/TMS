import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'send-sms':
        this.logger.log(`Processing SMS to ${job.data.phoneNumber}: ${job.data.message}`);
        // Add actual SMS gateway logic here
        break;
      case 'send-email':
        this.logger.log(`Processing Email to ${job.data.email}: ${job.data.subject}`);
        // Add actual Email gateway logic here
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }
}
