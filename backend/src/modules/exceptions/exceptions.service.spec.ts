import { Test, TestingModule } from '@nestjs/testing';
import { ExceptionsService } from './exceptions.service';
import { getModelToken } from '@nestjs/sequelize';
import { ExceptionRecord } from './models/exceptions.model';

describe('ExceptionsService', () => {
  let service: ExceptionsService;
  let modelMock: any;

  beforeEach(async () => {
    modelMock = {
      create: vi.fn(),
      findAndCountAll: vi.fn(),
      findOne: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExceptionsService,
        { provide: getModelToken(ExceptionRecord), useValue: modelMock },
      ],
    }).compile();

    service = module.get<ExceptionsService>(ExceptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
