import { Queue } from 'bullmq';
export declare class NotificationsService {
    private readonly notificationsQueue;
    constructor(notificationsQueue: Queue);
    sendSms(phoneNumber: string, message: string): Promise<import("bullmq").Job<any, any, string, import("bullmq").JobProgress>>;
    sendEmail(email: string, subject: string, body: string): Promise<import("bullmq").Job<any, any, string, import("bullmq").JobProgress>>;
}
