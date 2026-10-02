import { Test, TestingModule } from '@nestjs/testing';
import { DispatchService } from './dispatch.service';
import { getModelToken } from '@nestjs/sequelize';
import { Dispatch } from './models/dispatch.model';
import { Trip } from '../trips/models/trip.model';
import { Vehicle } from '../vehicles/models/vehicle.model';
import { Driver } from '../drivers/models/driver.model';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DispatchStatus, TripStatus } from '@prisma/client';

describe('DispatchService', () => {
  let service: DispatchService;
  let dispatchModel: any;
  let tripModel: any;
  let vehicleModel: any;
  let driverModel: any;

  const orgId = 'org-uuid-1';
  const userId = 'user-uuid-1';
  const tripId = 'trip-uuid-1';
  const dispatchId = 'dispatch-uuid-1';

  const mockTrip = {
    id: tripId,
    organizationId: orgId,
    tripNumber: 'TRIP-1001',
    status: TripStatus.ASSIGNED,
    vehicleId: 'vehicle-1',
    driverId: 'driver-1',
    actualStartDate: null,
  };

  const mockDispatch = {
    id: dispatchId,
    organizationId: orgId,
    tripId,
    dispatchNumber: 'DSP-1001',
    gatePassNumber: 'GP-999',
    status: DispatchStatus.DISPATCHED,
    dispatchedByUserId: userId,
    dispatchedAt: new Date(),
    remarks: 'Dispatched on time',
    createdAt: new Date(),
    updatedAt: new Date(),
    trip: mockTrip,
  };

  beforeEach(async () => {
    dispatchModel = {
      findOne: vi.fn(),
      findAndCountAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };
    tripModel = { findOne: vi.fn(), update: vi.fn() };
    vehicleModel = { update: vi.fn() };
    driverModel = { update: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DispatchService,
        { provide: getModelToken(Dispatch), useValue: dispatchModel },
        { provide: getModelToken(Trip), useValue: tripModel },
        { provide: getModelToken(Vehicle), useValue: vehicleModel },
        { provide: getModelToken(Driver), useValue: driverModel },
      ],
    }).compile();

    service = module.get<DispatchService>(DispatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a dispatch record and update trip/vehicle/driver status', async () => {
      tripModel.findOne.mockResolvedValue(mockTrip);
      dispatchModel.create.mockResolvedValue(mockDispatch);
      dispatchModel.findOne.mockResolvedValue(mockDispatch);

      const result = await service.create(orgId, userId, {
        tripId,
        dispatchNumber: 'DSP-1001',
        gatePassNumber: 'GP-999',
      });

      expect(result).toEqual(mockDispatch);
      expect(dispatchModel.create).toHaveBeenCalled();
      expect(tripModel.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: TripStatus.DISPATCHED }),
        { where: { id: tripId } }
      );
    });

    it('should throw ConflictException if dispatch number exists in organization', async () => {
      const uniqueError = new Error();
      uniqueError.name = 'SequelizeUniqueConstraintError';
      dispatchModel.create.mockRejectedValue(uniqueError);
      tripModel.findOne.mockResolvedValue(mockTrip);

      await expect(
        service.create(orgId, userId, {
          tripId,
          dispatchNumber: 'DSP-1001',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if trip does not exist in organization', async () => {
      tripModel.findOne.mockResolvedValue(null);

      await expect(
        service.create(orgId, userId, {
          tripId: 'non-existent',
          dispatchNumber: 'DSP-1001',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated list of dispatches', async () => {
      dispatchModel.findAndCountAll.mockResolvedValue({
        rows: [mockDispatch],
        count: 1,
      });

      const result = await service.findAll(orgId, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return dispatch details', async () => {
      dispatchModel.findOne.mockResolvedValue(mockDispatch);

      const result = await service.findOne(orgId, dispatchId);
      expect(result).toEqual(mockDispatch);
    });

    it('should throw NotFoundException if dispatch not found', async () => {
      dispatchModel.findOne.mockResolvedValue(null);

      await expect(service.findOne(orgId, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
