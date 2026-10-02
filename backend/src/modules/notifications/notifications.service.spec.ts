import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let queueMock: any;

  beforeEach(async () => {
    queueMock = {
      add: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getQueueToken('notifications'), useValue: queueMock },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should queue sms', async () => {
    await service.sendSms('1234567890', 'Hello');
    expect(queueMock.add).toHaveBeenCalledWith('send-sms', { phoneNumber: '1234567890', message: 'Hello' });
  });

  it('should queue email', async () => {
    await service.sendEmail('test@test.com', 'Subject', 'Body');
    expect(queueMock.add).toHaveBeenCalledWith('send-email', { email: 'test@test.com', subject: 'Subject', body: 'Body' });
  });
});
