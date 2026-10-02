import { Test, TestingModule } from '@nestjs/testing';
import { FuelService } from './fuel.service';
import { getModelToken } from '@nestjs/sequelize';
import { FuelLog } from './models/fuel.model';

describe('FuelService', () => {
  let service: FuelService;
  let modelMock: any;

  beforeEach(async () => {
    modelMock = {
      create: vi.fn(),
      findAndCountAll: vi.fn(),
      findOne: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FuelService,
        { provide: getModelToken(FuelLog), useValue: modelMock },
      ],
    }).compile();

    service = module.get<FuelService>(FuelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
