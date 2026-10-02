import { Test, TestingModule } from '@nestjs/testing';
import { TrackingEventsService } from './tracking-events.service';
import { getModelToken } from '@nestjs/sequelize';
import { TrackingEvent } from './models/tracking-event.model';
import { Trip } from '../trips/models/trip.model';
import { Vehicle } from '../vehicles/models/vehicle.model';
import { BadRequestException } from '@nestjs/common';

describe('TrackingEventsService', () => {
  let service: TrackingEventsService;
  let eventModel: any;
  let tripModel: any;
  let vehicleModel: any;

  const orgId = 'org-uuid-1';
  const tripId = 'trip-uuid-1';
  const vehicleId = 'vehicle-uuid-1';

  const mockTrip = { id: tripId, organizationId: orgId };
  const mockVehicle = { id: vehicleId, organizationId: orgId };

  const mockEvent = {
    id: 'event-uuid-1',
    organizationId: orgId,
    eventType: 'GEOFENCE_ENTER',
    tripId,
    vehicleId,
    eventTime: new Date(),
    source: 'SYSTEM',
  };

  beforeEach(async () => {
    eventModel = {
      findOne: vi.fn(),
      findAndCountAll: vi.fn(),
      create: vi.fn(),
    };
    tripModel = { findOne: vi.fn() };
    vehicleModel = { findOne: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackingEventsService,
        { provide: getModelToken(TrackingEvent), useValue: eventModel },
        { provide: getModelToken(Trip), useValue: tripModel },
        { provide: getModelToken(Vehicle), useValue: vehicleModel },
      ],
    }).compile();

    service = module.get<TrackingEventsService>(TrackingEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a tracking event', async () => {
      tripModel.findOne.mockResolvedValue(mockTrip);
      vehicleModel.findOne.mockResolvedValue(mockVehicle);
      eventModel.create.mockResolvedValue(mockEvent);

      const result = await service.create(orgId, {
        eventType: 'GEOFENCE_ENTER',
        tripId,
        vehicleId,
        eventTime: new Date().toISOString(),
      });

      expect(result).toEqual(mockEvent);
      expect(eventModel.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if neither tripId nor vehicleId provided', async () => {
      await expect(
        service.create(orgId, {
          eventType: 'GEOFENCE_ENTER',
          eventTime: new Date().toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated list of tracking events', async () => {
      eventModel.findAndCountAll.mockResolvedValue({
        rows: [mockEvent],
        count: 1,
      });

      const result = await service.findAll(orgId, { page: '1', limit: '10' });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });
});
