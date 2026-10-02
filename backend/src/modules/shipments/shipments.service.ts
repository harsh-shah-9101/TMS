import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Shipment } from './models/shipment.model';
import { ShipmentItem } from './models/shipment-item.model';
import { Customer } from '../customers/models/customer.model';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { QueryShipmentDto } from './dto/query-shipment.dto';
import { ShipmentStatus } from '@prisma/client'; // keeping this for DTO compatibility

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectModel(Shipment)
    private readonly shipmentModel: typeof Shipment,
    @InjectModel(Customer)
    private readonly customerModel: typeof Customer,
  ) {}

  // Valid allowed transitions map
  private readonly allowedTransitions: Record<string, string[]> = {
    [ShipmentStatus.DRAFT]: [ShipmentStatus.CREATED, ShipmentStatus.CANCELLED],
    [ShipmentStatus.CREATED]: [ShipmentStatus.VALIDATED, ShipmentStatus.PLANNED, ShipmentStatus.CANCELLED],
    [ShipmentStatus.VALIDATED]: [ShipmentStatus.PLANNED, ShipmentStatus.CANCELLED],
    [ShipmentStatus.PLANNED]: [ShipmentStatus.ASSIGNED, ShipmentStatus.CANCELLED],
    [ShipmentStatus.ASSIGNED]: [ShipmentStatus.IN_TRANSIT, ShipmentStatus.CANCELLED],
    [ShipmentStatus.IN_TRANSIT]: [ShipmentStatus.DELIVERED, ShipmentStatus.CANCELLED],
    [ShipmentStatus.DELIVERED]: [],
    [ShipmentStatus.CANCELLED]: [],
  };

  async create(organizationId: string, dto: CreateShipmentDto) {
    const formattedBookingNo = dto.bookingNumber.replace(/\s+/g, '').toUpperCase();

    // Verify customer
    const customer = await this.customerModel.findOne({
      where: { id: dto.customerId, organizationId },
    });
    if (!customer) {
      throw new BadRequestException(`Customer with ID '${dto.customerId}' not found in your organization`);
    }

    // Verify consignee if provided
    if (dto.consigneeId) {
      const consignee = await this.customerModel.findOne({
        where: { id: dto.consigneeId, organizationId },
      });
      if (!consignee) {
        throw new BadRequestException(`Consignee with ID '${dto.consigneeId}' not found in your organization`);
      }
    }

    // Calculate totals
    let totalWeightKg = 0;
    let totalVolumeCuFt = 0;

    if (dto.items && dto.items.length > 0) {
      for (const item of dto.items) {
        totalWeightKg += (item.weightKg || 0) * (item.quantity || 1);
        totalVolumeCuFt += (item.volumeCuFt || 0) * (item.quantity || 1);
      }
    }

    const itemsToCreate = dto.items ? dto.items.map((i) => ({
      description: i.description,
      quantity: i.quantity || 1,
      weightKg: i.weightKg || 0,
      volumeCuFt: i.volumeCuFt || 0,
      declaredValue: i.declaredValue,
    })) : undefined;

    try {
      const shipment = await this.shipmentModel.create(
        {
          organizationId,
          bookingNumber: formattedBookingNo,
          customerId: dto.customerId,
          consigneeId: dto.consigneeId,
          originCity: dto.originCity,
          originPincode: dto.originPincode,
          destinationCity: dto.destinationCity,
          destinationPincode: dto.destinationPincode,
          pickupDate: dto.pickupDate ? new Date(dto.pickupDate) : null,
          expectedDeliveryDate: dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : null,
          status: dto.status || ShipmentStatus.CREATED,
          totalWeightKg,
          totalVolumeCuFt,
          freightAmount: dto.freightAmount || 0,
          items: itemsToCreate as any,
        } as any,
        {
          include: [{ model: ShipmentItem, as: 'items' }],
        }
      );

      // Fetch the created shipment with associated customers
      return this.findOne(organizationId, shipment.id);
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException(
          `Shipment with booking number '${formattedBookingNo}' already exists in your organization`,
        );
      }
      throw error;
    }
  }

  async findAll(organizationId: string, query: QueryShipmentDto) {
    const { search, status, customerId, page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const where: any = { organizationId };

    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    if (search) {
      where[Op.or] = [
        { bookingNumber: { [Op.iLike]: `%${search}%` } },
        { originCity: { [Op.iLike]: `%${search}%` } },
        { destinationCity: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows: data, count: total } = await this.shipmentModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Customer, as: 'customer' },
        { model: Customer, as: 'consignee' },
        { model: ShipmentItem, as: 'items' },
      ],
      distinct: true, // required for accurate count when including hasMany relationships
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(organizationId: string, id: string) {
    const shipment = await this.shipmentModel.findOne({
      where: { id, organizationId },
      include: [
        { model: Customer, as: 'customer' },
        { model: Customer, as: 'consignee' },
        { model: ShipmentItem, as: 'items' },
      ],
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID '${id}' not found`);
    }

    return shipment;
  }

  async updateStatus(organizationId: string, id: string, dto: UpdateShipmentStatusDto) {
    const shipment = await this.findOne(organizationId, id);

    const currentStatus = shipment.status;
    const newStatus = dto.status;

    if (currentStatus === newStatus) {
      return shipment;
    }

    const allowed = this.allowedTransitions[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed transitions: [${allowed.join(', ')}]`,
      );
    }

    await this.shipmentModel.update(
      { status: newStatus },
      { where: { id, organizationId } }
    );

    return this.findOne(organizationId, id);
  }

  async update(organizationId: string, id: string, dto: UpdateShipmentDto) {
    await this.findOne(organizationId, id);

    let formattedBookingNo: string | undefined;

    if (dto.bookingNumber) {
      formattedBookingNo = dto.bookingNumber.replace(/\s+/g, '').toUpperCase();
    }

    try {
      const data: any = {};
      if (formattedBookingNo) data.bookingNumber = formattedBookingNo;
      if (dto.customerId) data.customerId = dto.customerId;
      if (dto.consigneeId !== undefined) data.consigneeId = dto.consigneeId;
      if (dto.originCity) data.originCity = dto.originCity;
      if (dto.originPincode !== undefined) data.originPincode = dto.originPincode;
      if (dto.destinationCity) data.destinationCity = dto.destinationCity;
      if (dto.destinationPincode !== undefined) data.destinationPincode = dto.destinationPincode;
      if (dto.pickupDate !== undefined) {
        data.pickupDate = dto.pickupDate ? new Date(dto.pickupDate) : null;
      }
      if (dto.expectedDeliveryDate !== undefined) {
        data.expectedDeliveryDate = dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : null;
      }
      if (dto.freightAmount !== undefined) data.freightAmount = dto.freightAmount;

      await this.shipmentModel.update(data, {
        where: { id, organizationId },
      });

      return this.findOne(organizationId, id);
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException(
          `Shipment with booking number '${formattedBookingNo}' already exists in your organization`,
        );
      }
      throw error;
    }
  }

  async remove(organizationId: string, id: string) {
    const shipment = await this.findOne(organizationId, id);
    
    // Sequelize paranoid option handles setting deletedAt
    await shipment.destroy();

    return { message: 'Shipment deleted successfully' };
  }
}
