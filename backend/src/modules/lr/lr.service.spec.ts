import { Test, TestingModule } from '@nestjs/testing';
import { LrService } from './lr.service';
import { getModelToken } from '@nestjs/sequelize';
import { LorryReceipt } from './models/lr.model';
import { Shipment } from '../shipments/models/shipment.model';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { FreightTerm, LRStatus } from '../../common/enums';

describe('LrService', () => {
  let service: LrService;
  let lrModel: any;
  let shipmentModel: any;

  const orgId = 'org-uuid-1';
  const shipmentId = 'shipment-uuid-1';
  const lrId = 'lr-uuid-1';

  const mockShipment = {
    id: shipmentId,
    organizationId: orgId,
    bookingNumber: 'BK-2026-0001',
  };

  const mockLr = {
    id: lrId,
    organizationId: orgId,
    shipmentId,
    lrNumber: 'LR-2026-001',
    consignorName: 'Reliance Industries Ltd',
    consigneeName: 'TCS Ltd',
    freightTerms: FreightTerm.TO_PAY,
    basicFreight: 40000,
    otherCharges: 2500,
    taxAmount: 2500,
    totalAmount: 45000,
    status: LRStatus.ISSUED,
    shipment: mockShipment,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    destroy: vi.fn(),
  };

  beforeEach(async () => {
    lrModel = {
      findOne: vi.fn(),
      findAndCountAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };

    shipmentModel = {
      findOne: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LrService,
        { provide: getModelToken(LorryReceipt), useValue: lrModel },
        { provide: getModelToken(Shipment), useValue: shipmentModel },
      ],
    }).compile();

    service = module.get<LrService>(LrService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an LR successfully with total amount calculation', async () => {
      shipmentModel.findOne.mockResolvedValue(mockShipment);
      lrModel.create.mockResolvedValue(mockLr);
      lrModel.findOne.mockResolvedValue(mockLr); // mock lookup at end

      const result = await service.create(orgId, {
        shipmentId,
        lrNumber: 'LR-2026-001',
        consignorName: 'Reliance Industries Ltd',
        consigneeName: 'TCS Ltd',
        basicFreight: 40000,
        otherCharges: 2500,
        taxAmount: 2500,
      });

      expect(result).toEqual(mockLr);
      expect(lrModel.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if LR number exists in organization', async () => {
      shipmentModel.findOne.mockResolvedValue(mockShipment);
      const uniqueError = new Error();
      uniqueError.name = 'SequelizeUniqueConstraintError';
      lrModel.create.mockRejectedValue(uniqueError);

      await expect(
        service.create(orgId, {
          shipmentId,
          lrNumber: 'LR-2026-001',
          consignorName: 'Reliance Industries Ltd',
          consigneeName: 'TCS Ltd',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if shipment not found', async () => {
      shipmentModel.findOne.mockResolvedValue(null);

      await expect(
        service.create(orgId, {
          shipmentId: 'invalid-shipment',
          lrNumber: 'LR-2026-999',
          consignorName: 'Reliance Industries Ltd',
          consigneeName: 'TCS Ltd',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return LR details', async () => {
      lrModel.findOne.mockResolvedValue(mockLr);

      const result = await service.findOne(orgId, lrId);
      expect(result).toEqual(mockLr);
    });

    it('should throw NotFoundException if LR not found', async () => {
      lrModel.findOne.mockResolvedValue(null);

      await expect(service.findOne(orgId, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
