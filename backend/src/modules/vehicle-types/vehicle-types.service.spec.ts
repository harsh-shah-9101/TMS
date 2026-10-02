import { Test, TestingModule } from '@nestjs/testing';
import { VehicleTypesService } from './vehicle-types.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { FuelType, VehicleTypeStatus } from '@prisma/client';

describe('VehicleTypesService', () => {
  let service: VehicleTypesService;
  let prismaService: any;

  const orgId = 'org-uuid-1';
  const vehicleTypeId = 'vt-uuid-1';

  const mockVehicleType = {
    id: vehicleTypeId,
    organizationId: orgId,
    name: '32ft Container',
    code: '32MX',
    capacityTons: 15.5,
    volumeCuFt: 1850,
    axleCount: 3,
    fuelType: FuelType.DIESEL,
    status: VehicleTypeStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    prismaService = {
      vehicleType: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleTypesService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<VehicleTypesService>(VehicleTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create vehicle type successfully', async () => {
      prismaService.vehicleType.findFirst.mockResolvedValue(null);
      prismaService.vehicleType.create.mockResolvedValue(mockVehicleType);

      const result = await service.create(orgId, {
        name: '32ft Container',
        code: '32MX',
        capacityTons: 15.5,
      });

      expect(result).toEqual(mockVehicleType);
      expect(prismaService.vehicleType.create).toHaveBeenCalled();
    });

    it('should throw ConflictException on duplicate code in organization', async () => {
      prismaService.vehicleType.findFirst.mockResolvedValue(mockVehicleType);

      await expect(
        service.create(orgId, {
          name: '32ft Container',
          code: '32MX',
          capacityTons: 15.5,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated vehicle types', async () => {
      prismaService.vehicleType.findMany.mockResolvedValue([mockVehicleType]);
      prismaService.vehicleType.count.mockResolvedValue(1);

      const result = await service.findAll(orgId, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return vehicle type if found', async () => {
      prismaService.vehicleType.findFirst.mockResolvedValue(mockVehicleType);

      const result = await service.findOne(orgId, vehicleTypeId);
      expect(result).toEqual(mockVehicleType);
    });

    it('should throw NotFoundException if vehicle type not found', async () => {
      prismaService.vehicleType.findFirst.mockResolvedValue(null);

      await expect(service.findOne(orgId, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete vehicle type', async () => {
      prismaService.vehicleType.findFirst.mockResolvedValue(mockVehicleType);
      prismaService.vehicleType.update.mockResolvedValue({
        ...mockVehicleType,
        deletedAt: new Date(),
      });

      const result = await service.remove(orgId, vehicleTypeId);
      expect(result.message).toContain('deleted successfully');
      expect(prismaService.vehicleType.update).toHaveBeenCalledWith({
        where: { id: vehicleTypeId },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
