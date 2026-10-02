import { Test, TestingModule } from '@nestjs/testing';
import { DriversService } from './drivers.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DriverStatus } from '../../common/enums';

describe('DriversService', () => {
  let service: DriversService;
  let prismaService: any;

  const orgId = 'org-uuid-1';
  const driverId = 'driver-uuid-1';
  const userId = 'user-uuid-1';

  const mockDriver = {
    id: driverId,
    organizationId: orgId,
    firstName: 'Rahul',
    lastName: 'Sharma',
    phone: '+919876543210',
    licenseNumber: 'DL1420110012345',
    licenseCategory: 'HMV',
    licenseExpiry: new Date('2028-12-31'),
    status: DriverStatus.AVAILABLE,
    userId: null,
    user: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    prismaService = {
      driver: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      user: {
        findFirst: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriversService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<DriversService>(DriversService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a driver successfully', async () => {
      prismaService.driver.findFirst.mockResolvedValue(null);
      prismaService.driver.create.mockResolvedValue(mockDriver);

      const result = await service.create(orgId, {
        firstName: 'Rahul',
        lastName: 'Sharma',
        phone: '+919876543210',
        licenseNumber: 'DL14 201100 12345',
      });

      expect(result).toEqual(mockDriver);
      expect(prismaService.driver.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          organizationId: orgId,
          licenseNumber: 'DL1420110012345',
        }),
        include: {
          user: {
            select: {
              id: true,
              email: true,
              status: true,
            },
          },
        },
      });
    });

    it('should throw ConflictException if license number exists in organization', async () => {
      prismaService.driver.findFirst.mockResolvedValue(mockDriver);

      await expect(
        service.create(orgId, {
          firstName: 'Rahul',
          lastName: 'Sharma',
          phone: '+919876543210',
          licenseNumber: 'DL1420110012345',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if associated user is not found in organization', async () => {
      prismaService.driver.findFirst.mockResolvedValue(null);
      prismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.create(orgId, {
          firstName: 'Rahul',
          lastName: 'Sharma',
          phone: '+919876543210',
          licenseNumber: 'DL1420110099999',
          userId: 'invalid-user-id',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated list of drivers', async () => {
      prismaService.driver.findMany.mockResolvedValue([mockDriver]);
      prismaService.driver.count.mockResolvedValue(1);

      const result = await service.findAll(orgId, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return driver details', async () => {
      prismaService.driver.findFirst.mockResolvedValue(mockDriver);

      const result = await service.findOne(orgId, driverId);
      expect(result).toEqual(mockDriver);
    });

    it('should throw NotFoundException if driver not found', async () => {
      prismaService.driver.findFirst.mockResolvedValue(null);

      await expect(service.findOne(orgId, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should soft delete driver', async () => {
      prismaService.driver.findFirst.mockResolvedValue(mockDriver);
      prismaService.driver.update.mockResolvedValue({
        ...mockDriver,
        deletedAt: new Date(),
      });

      const result = await service.remove(orgId, driverId);
      expect(result.message).toContain('deleted successfully');
      expect(prismaService.driver.update).toHaveBeenCalledWith({
        where: { id: driverId },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });
});
