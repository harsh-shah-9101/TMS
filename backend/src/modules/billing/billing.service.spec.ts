import { Test, TestingModule } from '@nestjs/testing';
import { BillingService } from './billing.service';
import { getModelToken } from '@nestjs/sequelize';
import { Invoice } from './models/billing.model';

describe('BillingService', () => {
  let service: BillingService;
  let modelMock: any;

  beforeEach(async () => {
    modelMock = {
      create: vi.fn(),
      findAndCountAll: vi.fn(),
      findOne: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: getModelToken(Invoice), useValue: modelMock },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
