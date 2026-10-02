import { Test, TestingModule } from '@nestjs/testing';
import { PodService } from './pod.service';
import { getModelToken } from '@nestjs/sequelize';
import { Pod } from './models/pod.model';

describe('PodService', () => {
  let service: PodService;
  let modelMock: any;

  beforeEach(async () => {
    modelMock = {
      create: vi.fn(),
      findAndCountAll: vi.fn(),
      findOne: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PodService,
        { provide: getModelToken(Pod), useValue: modelMock },
      ],
    }).compile();

    service = module.get<PodService>(PodService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
