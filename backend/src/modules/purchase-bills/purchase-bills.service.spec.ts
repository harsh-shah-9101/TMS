import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseBillsService } from './purchase-bills.service';
import { getModelToken } from '@nestjs/sequelize';
import { PurchaseBill } from './models/purchase-bills.model';

describe('PurchaseBillsService', () => {
  let service: PurchaseBillsService;
  let modelMock: any;

  beforeEach(async () => {
    modelMock = {
      create: vi.fn(),
      findAndCountAll: vi.fn(),
      findOne: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseBillsService,
        { provide: getModelToken(PurchaseBill), useValue: modelMock },
      ],
    }).compile();

    service = module.get<PurchaseBillsService>(PurchaseBillsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
