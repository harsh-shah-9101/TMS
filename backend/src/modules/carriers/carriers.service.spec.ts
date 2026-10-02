import { Test, TestingModule } from '@nestjs/testing';
import { CarriersService } from './carriers.service';
import { getModelToken } from '@nestjs/sequelize';
import { Carrier } from './models/carrier.model';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CarrierStatus } from '../../common/enums';

describe('CarriersService', () => {
  let service: CarriersService;
  let model: any;

  const orgId = 'org-uuid-1';
  const carrierId = 'carrier-uuid-1';

  const mockCarrier = {
    id: carrierId,
    organizationId: orgId,
    name: 'VRL Logistics Ltd',
    code: 'VRL001',
    gstin: '29AAAAA0000A1Z5',
    pan: 'AAAAA0000A',
    email: 'ops@vrllogistics.com',
    phone: '+918362237600',
    addressLine1: 'Varur, Hubballi',
    city: 'Hubballi',
    state: 'Karnataka',
    pincode: '581207',
    rating: 4.8,
    status: CarrierStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    destroy: vi.fn(),
  };

  beforeEach(async () => {
    model = {
      findOne: vi.fn(),
      findAndCountAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      destroy: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarriersService,
        { provide: getModelToken(Carrier), useValue: model },
      ],
    }).compile();

    service = module.get<CarriersService>(CarriersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a carrier successfully', async () => {
      model.create.mockResolvedValue(mockCarrier);

      const result = await service.create(orgId, {
        name: 'VRL Logistics Ltd',
        code: 'VRL001',
        gstin: '29AAAAA0000A1Z5',
      });

      expect(result).toEqual(mockCarrier);
      expect(model.create).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: orgId,
          code: 'VRL001',
        }),
      );
    });

    it('should throw ConflictException if carrier code exists in organization', async () => {
      const uniqueError = new Error();
      uniqueError.name = 'SequelizeUniqueConstraintError';
      model.create.mockRejectedValue(uniqueError);

      await expect(
        service.create(orgId, {
          name: 'VRL Logistics Ltd',
          code: 'VRL001',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated list of carriers', async () => {
      model.findAndCountAll.mockResolvedValue({
        rows: [mockCarrier],
        count: 1,
      });

      const result = await service.findAll(orgId, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return carrier details', async () => {
      model.findOne.mockResolvedValue(mockCarrier);

      const result = await service.findOne(orgId, carrierId);
      expect(result).toEqual(mockCarrier);
    });

    it('should throw NotFoundException if carrier not found', async () => {
      model.findOne.mockResolvedValue(null);

      await expect(service.findOne(orgId, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete carrier', async () => {
      model.findOne.mockResolvedValue(mockCarrier);

      const result = await service.remove(orgId, carrierId);
      expect(result.message).toContain('deleted successfully');
      expect(mockCarrier.destroy).toHaveBeenCalled();
    });
  });
});
