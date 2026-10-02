import { Test, TestingModule } from '@nestjs/testing';
import { VehicleLocationsService } from './vehicle-locations.service';
import { getModelToken } from '@nestjs/sequelize';
import { VehicleLocation } from './models/vehicle-location.model';
import { Vehicle } from '../vehicles/models/vehicle.model';
import { NotFoundException } from '@nestjs/common';

describe('VehicleLocationsService', () => {
  let service: VehicleLocationsService;
  let locationModel: any;
  let vehicleModel: any;

  const orgId = 'org-uuid-1';
  const vehicleId = 'vehicle-uuid-1';

  const mockVehicle = {
    id: vehicleId,
    organizationId: orgId,
  };

  const mockLocation = {
    id: 'loc-uuid-1',
    organizationId: orgId,
    vehicleId,
    latitude: 12.34,
    longitude: 56.78,
    speed: 40,
    heading: 90,
    recordedAt: new Date(),
    source: 'GPS_DEVICE',
  };

  beforeEach(async () => {
    locationModel = {
      findOne: vi.fn(),
      findAndCountAll: vi.fn(),
      create: vi.fn(),
    };
    vehicleModel = { findOne: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleLocationsService,
        { provide: getModelToken(VehicleLocation), useValue: locationModel },
        { provide: getModelToken(Vehicle), useValue: vehicleModel },
      ],
    }).compile();

    service = module.get<VehicleLocationsService>(VehicleLocationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a location', async () => {
      vehicleModel.findOne.mockResolvedValue(mockVehicle);
      locationModel.create.mockResolvedValue(mockLocation);

      const result = await service.create(orgId, {
        vehicleId,
        latitude: 12.34,
        longitude: 56.78,
        recordedAt: new Date().toISOString(),
      });

      expect(result).toEqual(mockLocation);
      expect(locationModel.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if vehicle does not exist', async () => {
      vehicleModel.findOne.mockResolvedValue(null);

      await expect(
        service.create(orgId, {
          vehicleId: 'non-existent',
          latitude: 12.34,
          longitude: 56.78,
          recordedAt: new Date().toISOString(),
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated list of locations', async () => {
      locationModel.findAndCountAll.mockResolvedValue({
        rows: [mockLocation],
        count: 1,
      });

      const result = await service.findAll(orgId, { page: '1', limit: '10' });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('getLatestLocation', () => {
    it('should return latest location details', async () => {
      locationModel.findOne.mockResolvedValue(mockLocation);

      const result = await service.getLatestLocation(orgId, vehicleId);
      expect(result).toEqual(mockLocation);
    });

    it('should throw NotFoundException if location not found', async () => {
      locationModel.findOne.mockResolvedValue(null);

      await expect(service.getLatestLocation(orgId, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
