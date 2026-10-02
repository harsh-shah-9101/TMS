import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesService } from './vehicles.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { OwnershipType, VehicleStatus } from '../../common/enums';

describe('VehiclesService', () => {
  let service: VehiclesService;
  let prismaService: any;

  const orgId = 'org-uuid-1';
  const vehicleTypeId = 'vt-uuid-1';
  const vehicleId = 'vehicle-uuid-1';

  const mockVehicleType = {
    id: vehicleTypeId,
    organizationId: orgId,
    name: '32ft Container',
    code: '32MX',
  };

  const mockVehicle = {
    id: vehicleId,
    organizationId: orgId,
    vehicleTypeId,
    registrationNumber: 'MH12AB1234',
    make: 'Tata Motors',
    model: 'Prima 5530.S',
    status: VehicleStatus.AVAILABLE,
    ownershipType: OwnershipType.OWNED,
    currentOdometer: 12500,
    vehicleType: mockVehicleType,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    prismaService = {
      vehicleType: {
        findFirst: vi.fn(),
      },
      vehicle: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a vehicle successfully', async () => {
      prismaService.vehicleType.findFirst.mockResolvedValue(mockVehicleType);
      prismaService.vehicle.findFirst.mockResolvedValue(null);
      prismaService.vehicle.create.mockResolvedValue(mockVehicle);

      const result = await service.create(orgId, {
        vehicleTypeId,
        registrationNumber: 'MH 12 AB 1234',
      });

      expect(result).toEqual(mockVehicle);
      expect(prismaService.vehicle.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          organizationId: orgId,
          vehicleTypeId,
          registrationNumber: 'MH12AB1234',
        }),
        include: { vehicleType: true },
      });
    });

    it('should throw BadRequestException if vehicle type does not exist', async () => {
      prismaService.vehicleType.findFirst.mockResolvedValue(null);

      await expect(
        service.create(orgId, {
          vehicleTypeId: 'invalid-vt',
          registrationNumber: 'MH12AB1234',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if registration number exists', async () => {
      prismaService.vehicleType.findFirst.mockResolvedValue(mockVehicleType);
      prismaService.vehicle.findFirst.mockResolvedValue(mockVehicle);

      await expect(
        service.create(orgId, {
          vehicleTypeId,
          registrationNumber: 'MH12AB1234',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated list of vehicles', async () => {
      prismaService.vehicle.findMany.mockResolvedValue([mockVehicle]);
      prismaService.vehicle.count.mockResolvedValue(1);

      const result = await service.findAll(orgId, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return vehicle details', async () => {
      prismaService.vehicle.findFirst.mockResolvedValue(mockVehicle);

      const result = await service.findOne(orgId, vehicleId);
      expect(result).toEqual(mockVehicle);
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      prismaService.vehicle.findFirst.mockResolvedValue(null);

      await expect(service.findOne(orgId, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete vehicle', async () => {
      prismaService.vehicle.findFirst.mockResolvedValue(mockVehicle);
      prismaService.vehicle.update.mockResolvedValue({
        ...mockVehicle,
        deletedAt: new Date(),
      });

      const result = await service.remove(orgId, vehicleId);
      expect(result.message).toContain('deleted successfully');
      expect(prismaService.vehicle.update).toHaveBeenCalledWith({
        where: { id: vehicleId },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
