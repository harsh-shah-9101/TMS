import { Test, TestingModule } from '@nestjs/testing';
import { DriverAdvancesService } from './driver-advances.service';
import { getModelToken } from '@nestjs/sequelize';
import { DriverAdvance } from './models/driver-advances.model';

describe('DriverAdvancesService', () => {
  let service: DriverAdvancesService;
  let modelMock: any;

  beforeEach(async () => {
    modelMock = {
      create: vi.fn(),
      findAndCountAll: vi.fn(),
      findOne: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriverAdvancesService,
        { provide: getModelToken(DriverAdvance), useValue: modelMock },
      ],
    }).compile();

    service = module.get<DriverAdvancesService>(DriverAdvancesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
