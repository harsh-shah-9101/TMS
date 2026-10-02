import { Test, TestingModule } from '@nestjs/testing';
import { SettlementsService } from './settlements.service';
import { getModelToken } from '@nestjs/sequelize';
import { Settlement } from './models/settlements.model';

describe('SettlementsService', () => {
  let service: SettlementsService;
  let modelMock: any;

  beforeEach(async () => {
    modelMock = {
      create: vi.fn(),
      findAndCountAll: vi.fn(),
      findOne: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettlementsService,
        { provide: getModelToken(Settlement), useValue: modelMock },
      ],
    }).compile();

    service = module.get<SettlementsService>(SettlementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
