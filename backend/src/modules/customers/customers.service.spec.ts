import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { getModelToken } from '@nestjs/sequelize';
import { Customer } from './models/customer.model';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CustomerStatus, CustomerType } from '@prisma/client';

describe('CustomersService', () => {
  let service: CustomersService;
  let model: any;

  const orgId = 'org-uuid-1';
  const customerId = 'cust-uuid-1';

  const mockCustomer = {
    id: customerId,
    organizationId: orgId,
    name: 'Reliance Industries Ltd',
    code: 'RIL001',
    type: CustomerType.BOTH,
    gstin: '27AAAAA0000A1Z5',
    pan: 'AAAAA0000A',
    email: 'logistics@ril.com',
    phone: '+912222888800',
    addressLine1: 'Maker Chambers IV',
    addressLine2: null,
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400021',
    status: CustomerStatus.ACTIVE,
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
        CustomersService,
        { provide: getModelToken(Customer), useValue: model },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a customer successfully', async () => {
      model.create.mockResolvedValue(mockCustomer);

      const result = await service.create(orgId, {
        name: 'Reliance Industries Ltd',
        code: 'RIL001',
        gstin: '27AAAAA0000A1Z5',
      });

      expect(result).toEqual(mockCustomer);
      expect(model.create).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: orgId,
          code: 'RIL001',
        }),
      );
    });

    it('should throw ConflictException if customer code exists in organization', async () => {
      const uniqueError = new Error();
      uniqueError.name = 'SequelizeUniqueConstraintError';
      model.create.mockRejectedValue(uniqueError);

      await expect(
        service.create(orgId, {
          name: 'Reliance Industries Ltd',
          code: 'RIL001',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated list of customers', async () => {
      model.findAndCountAll.mockResolvedValue({
        rows: [mockCustomer],
        count: 1,
      });

      const result = await service.findAll(orgId, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return customer details', async () => {
      model.findOne.mockResolvedValue(mockCustomer);

      const result = await service.findOne(orgId, customerId);
      expect(result).toEqual(mockCustomer);
    });

    it('should throw NotFoundException if customer not found', async () => {
      model.findOne.mockResolvedValue(null);

      await expect(service.findOne(orgId, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete customer', async () => {
      model.findOne.mockResolvedValue(mockCustomer);

      const result = await service.remove(orgId, customerId);
      expect(result.message).toContain('deleted successfully');
      expect(mockCustomer.destroy).toHaveBeenCalled();
    });
  });
});
