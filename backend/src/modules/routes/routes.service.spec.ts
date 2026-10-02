import { Test, TestingModule } from '@nestjs/testing';
import { RoutesService } from './routes.service';
import { getModelToken } from '@nestjs/sequelize';
import { Route } from './models/route.model';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { RouteStatus } from '../../common/enums';

describe('RoutesService', () => {
  let service: RoutesService;
  let routeModel: any;

  const orgId = 'org-uuid-1';
  const routeId = 'route-uuid-1';

  const mockRoute = {
    id: routeId,
    organizationId: orgId,
    name: 'Mumbai to Bengaluru Express',
    code: 'RT-MUM-BLR',
    originCity: 'Mumbai',
    originState: 'Maharashtra',
    destinationCity: 'Bengaluru',
    destinationState: 'Karnataka',
    distanceKm: 980.5,
    estimatedHours: 22.5,
    status: RouteStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    destroy: vi.fn(),
  };

  beforeEach(async () => {
    routeModel = {
      findOne: vi.fn(),
      findAndCountAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoutesService,
        { provide: getModelToken(Route), useValue: routeModel },
      ],
    }).compile();

    service = module.get<RoutesService>(RoutesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a route successfully', async () => {
      routeModel.create.mockResolvedValue(mockRoute);

      const result = await service.create(orgId, {
        name: 'Mumbai to Bengaluru Express',
        code: 'rt-mum-blr',
        originCity: 'Mumbai',
        destinationCity: 'Bengaluru',
      });

      expect(result).toEqual(mockRoute);
      expect(routeModel.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if route code exists in organization', async () => {
      const uniqueError = new Error();
      uniqueError.name = 'SequelizeUniqueConstraintError';
      routeModel.create.mockRejectedValue(uniqueError);

      await expect(
        service.create(orgId, {
          name: 'Mumbai to Bengaluru Express',
          code: 'rt-mum-blr',
          originCity: 'Mumbai',
          destinationCity: 'Bengaluru',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated list of routes', async () => {
      routeModel.findAndCountAll.mockResolvedValue({
        rows: [mockRoute],
        count: 1,
      });

      const result = await service.findAll(orgId, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return route details', async () => {
      routeModel.findOne.mockResolvedValue(mockRoute);

      const result = await service.findOne(orgId, routeId);
      expect(result).toEqual(mockRoute);
    });

    it('should throw NotFoundException if route not found', async () => {
      routeModel.findOne.mockResolvedValue(null);

      await expect(service.findOne(orgId, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update route successfully', async () => {
      routeModel.findOne.mockResolvedValueOnce(mockRoute) // initial check
                        .mockResolvedValueOnce({ ...mockRoute, distanceKm: 1200 }); // return after update
      routeModel.update.mockResolvedValue([1]);

      const result = await service.update(orgId, routeId, {
        distanceKm: 1200,
      });

      expect(routeModel.update).toHaveBeenCalled();
      expect(result.distanceKm).toBe(1200);
    });

    it('should throw ConflictException if updated code exists', async () => {
      routeModel.findOne.mockResolvedValue(mockRoute);
      const uniqueError = new Error();
      uniqueError.name = 'SequelizeUniqueConstraintError';
      routeModel.update.mockRejectedValue(uniqueError);

      await expect(
        service.update(orgId, routeId, {
          code: 'EXISTING-CODE',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should soft delete route', async () => {
      routeModel.findOne.mockResolvedValue(mockRoute);

      const result = await service.remove(orgId, routeId);
      expect(result.message).toContain('deleted successfully');
      expect(mockRoute.destroy).toHaveBeenCalled();
    });
  });
});

