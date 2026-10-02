import { Test, TestingModule } from '@nestjs/testing';
import { ComplianceService } from './compliance.service';
import { getModelToken } from '@nestjs/sequelize';
import { ComplianceDocument } from './models/compliance.model';

describe('ComplianceService', () => {
  let service: ComplianceService;
  let modelMock: any;

  beforeEach(async () => {
    modelMock = {
      create: vi.fn(),
      findAndCountAll: vi.fn(),
      findOne: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplianceService,
        { provide: getModelToken(ComplianceDocument), useValue: modelMock },
      ],
    }).compile();

    service = module.get<ComplianceService>(ComplianceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
