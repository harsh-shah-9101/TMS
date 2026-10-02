import { Test, TestingModule } from '@nestjs/testing';
import { TripsService } from './trips.service';
import { getModelToken } from '@nestjs/sequelize';
import { Trip } from './models/trip.model';
import { TripStop } from './models/trip-stop.model';
import { Route } from '../routes/models/route.model';
import { Vehicle } from '../vehicles/models/vehicle.model';
import { Driver } from '../drivers/models/driver.model';
import { Carrier } from '../carriers/models/carrier.model';
import { Shipment } from '../shipments/models/shipment.model';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { TripStatus } from '../../common/enums';

describe('TripsService', () => {
  let service: TripsService;
  
  let tripModel: any;
  let tripStopModel: any;
  let routeModel: any;
  let vehicleModel: any;
  let driverModel: any;
  let carrierModel: any;
  let shipmentModel: any;

  const orgId = 'org-uuid-1';
  const tripId = 'trip-uuid-1';

  const mockTrip = {
    id: tripId,
    organizationId: orgId,
    tripNumber: 'TRIP-1001',
    routeId: null,
    vehicleId: null,
    driverId: null,
    carrierId: null,
    status: TripStatus.PLANNED,
    plannedStartDate: null,
    plannedEndDate: null,
    startOdometer: 1000,
    endOdometer: null,
    remarks: 'Test Trip',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    stops: [],
    destroy: vi.fn(),
  };

  beforeEach(async () => {
    tripModel = {
      findOne: vi.fn(),
      findAndCountAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };
    tripStopModel = { findOne: vi.fn(), create: vi.fn(), update: vi.fn() };
    routeModel = { findOne: vi.fn() };
    vehicleModel = { findOne: vi.fn(), update: vi.fn() };
    driverModel = { findOne: vi.fn(), update: vi.fn() };
    carrierModel = { findOne: vi.fn() };
    shipmentModel = { findOne: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsService,
        { provide: getModelToken(Trip), useValue: tripModel },
        { provide: getModelToken(TripStop), useValue: tripStopModel },
        { provide: getModelToken(Route), useValue: routeModel },
        { provide: getModelToken(Vehicle), useValue: vehicleModel },
        { provide: getModelToken(Driver), useValue: driverModel },
        { provide: getModelToken(Carrier), useValue: carrierModel },
        { provide: getModelToken(Shipment), useValue: shipmentModel },
      ],
    }).compile();

    service = module.get<TripsService>(TripsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a trip successfully', async () => {
      tripModel.create.mockResolvedValue(mockTrip);
      tripModel.findOne.mockResolvedValue(mockTrip);

      const result = await service.create(orgId, {
        tripNumber: 'TRIP-1001',
        remarks: 'Test Trip',
      });

      expect(result).toEqual(mockTrip);
      expect(tripModel.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if trip number exists in organization', async () => {
      const uniqueError = new Error();
      uniqueError.name = 'SequelizeUniqueConstraintError';
      tripModel.create.mockRejectedValue(uniqueError);

      await expect(
        service.create(orgId, { tripNumber: 'TRIP-1001' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated list of trips', async () => {
      tripModel.findAndCountAll.mockResolvedValue({
        rows: [mockTrip],
        count: 1,
      });

      const result = await service.findAll(orgId, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return trip details', async () => {
      tripModel.findOne.mockResolvedValue(mockTrip);

      const result = await service.findOne(orgId, tripId);
      expect(result).toEqual(mockTrip);
    });

    it('should throw NotFoundException if trip not found', async () => {
      tripModel.findOne.mockResolvedValue(null);

      await expect(service.findOne(orgId, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should transition trip status successfully', async () => {
      tripModel.findOne.mockResolvedValueOnce(mockTrip)
                       .mockResolvedValueOnce({ ...mockTrip, status: TripStatus.ASSIGNED });
      tripModel.update.mockResolvedValue([1]);

      const result = await service.updateStatus(orgId, tripId, {
        status: TripStatus.ASSIGNED,
      });

      expect(result.status).toBe(TripStatus.ASSIGNED);
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      tripModel.findOne.mockResolvedValue(mockTrip); // PLANNED

      await expect(
        service.updateStatus(orgId, tripId, { status: TripStatus.COMPLETED }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should soft delete trip', async () => {
      tripModel.findOne.mockResolvedValue(mockTrip);

      const result = await service.remove(orgId, tripId);
      expect(result.message).toContain('deleted successfully');
      expect(mockTrip.destroy).toHaveBeenCalled();
    });
  });
});
