import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    sendSms(body: {
        phoneNumber: string;
        message: string;
    }): Promise<import("bullmq").Job<any, any, string, import("bullmq").JobProgress>>;
    sendEmail(body: {
        email: string;
        subject: string;
        content: string;
    }): Promise<import("bullmq").Job<any, any, string, import("bullmq").JobProgress>>;
}
