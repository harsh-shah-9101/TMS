import { Test, TestingModule } from '@nestjs/testing';
import { ShipmentsService } from './shipments.service';
import { getModelToken } from '@nestjs/sequelize';
import { Shipment } from './models/shipment.model';
import { Customer } from '../customers/models/customer.model';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ShipmentStatus } from '@prisma/client';

describe('ShipmentsService', () => {
  let service: ShipmentsService;
  let shipmentModel: any;
  let customerModel: any;

  const orgId = 'org-uuid-1';
  const customerId = 'cust-uuid-1';
  const shipmentId = 'shipment-uuid-1';

  const mockCustomer = {
    id: customerId,
    organizationId: orgId,
    name: 'Reliance Industries',
  };

  const mockShipment = {
    id: shipmentId,
    organizationId: orgId,
    bookingNumber: 'BK-2026-0001',
    customerId,
    consigneeId: null,
    originCity: 'Mumbai',
    destinationCity: 'Bengaluru',
    status: ShipmentStatus.CREATED,
    totalWeightKg: 1250,
    totalVolumeCuFt: 225,
    freightAmount: 45000,
    customer: mockCustomer,
    consignee: null,
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    destroy: vi.fn(),
  };

  beforeEach(async () => {
    shipmentModel = {
      findOne: vi.fn(),
      findAndCountAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };

    customerModel = {
      findOne: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentsService,
        { provide: getModelToken(Shipment), useValue: shipmentModel },
        { provide: getModelToken(Customer), useValue: customerModel },
      ],
    }).compile();

    service = module.get<ShipmentsService>(ShipmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a shipment successfully', async () => {
      customerModel.findOne.mockResolvedValue(mockCustomer);
      shipmentModel.create.mockResolvedValue(mockShipment);
      // findOne called at the end of create
      shipmentModel.findOne.mockResolvedValue(mockShipment);

      const result = await service.create(orgId, {
        bookingNumber: 'BK-2026-0001',
        customerId,
        originCity: 'Mumbai',
        destinationCity: 'Bengaluru',
        items: [
          { description: 'Spares', quantity: 5, weightKg: 250, volumeCuFt: 45 },
        ],
      });

      expect(result).toEqual(mockShipment);
      expect(shipmentModel.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if booking number exists in organization', async () => {
      customerModel.findOne.mockResolvedValue(mockCustomer);
      const uniqueError = new Error();
      uniqueError.name = 'SequelizeUniqueConstraintError';
      shipmentModel.create.mockRejectedValue(uniqueError);

      await expect(
        service.create(orgId, {
          bookingNumber: 'BK-2026-0001',
          customerId,
          originCity: 'Mumbai',
          destinationCity: 'Bengaluru',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if customer not found', async () => {
      customerModel.findOne.mockResolvedValue(null);

      await expect(
        service.create(orgId, {
          bookingNumber: 'BK-2026-9999',
          customerId: 'invalid-cust',
          originCity: 'Mumbai',
          destinationCity: 'Bengaluru',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    it('should allow valid status transition (CREATED -> VALIDATED)', async () => {
      shipmentModel.findOne.mockResolvedValue(mockShipment);
      shipmentModel.update.mockResolvedValue([1]); // mock successful update
      shipmentModel.findOne.mockResolvedValueOnce(mockShipment) // first findOne
                           .mockResolvedValueOnce({ // second findOne
                             ...mockShipment,
                             status: ShipmentStatus.VALIDATED,
                           });

      const result = await service.updateStatus(orgId, shipmentId, {
        status: ShipmentStatus.VALIDATED,
      });

      expect(result.status).toBe(ShipmentStatus.VALIDATED);
    });

    it('should disallow invalid status transition (DELIVERED -> PLANNED)', async () => {
      shipmentModel.findOne.mockResolvedValue({
        ...mockShipment,
        status: ShipmentStatus.DELIVERED,
      });

      await expect(
        service.updateStatus(orgId, shipmentId, {
          status: ShipmentStatus.PLANNED,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return shipment details', async () => {
      shipmentModel.findOne.mockResolvedValue(mockShipment);

      const result = await service.findOne(orgId, shipmentId);
      expect(result).toEqual(mockShipment);
    });

    it('should throw NotFoundException if shipment not found', async () => {
      shipmentModel.findOne.mockResolvedValue(null);

      await expect(service.findOne(orgId, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
