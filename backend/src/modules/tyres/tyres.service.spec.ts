import { Test, TestingModule } from '@nestjs/testing';
import { TyresService } from './tyres.service';
import { getModelToken } from '@nestjs/sequelize';
import { Tyre } from './models/tyres.model';

describe('TyresService', () => {
  let service: TyresService;
  let modelMock: any;

  beforeEach(async () => {
    modelMock = {
      create: vi.fn(),
      findAndCountAll: vi.fn(),
      findOne: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TyresService,
        { provide: getModelToken(Tyre), useValue: modelMock },
      ],
    }).compile();

    service = module.get<TyresService>(TyresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
