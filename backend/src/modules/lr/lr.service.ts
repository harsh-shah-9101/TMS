import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { LorryReceipt } from './models/lr.model';
import { Shipment } from '../shipments/models/shipment.model';
import { CreateLrDto } from './dto/create-lr.dto';
import { UpdateLrDto } from './dto/update-lr.dto';
import { QueryLrDto } from './dto/query-lr.dto';

@Injectable()
export class LrService {
  constructor(
    @InjectModel(LorryReceipt)
    private readonly lrModel: typeof LorryReceipt,
    @InjectModel(Shipment)
    private readonly shipmentModel: typeof Shipment,
  ) {}

  async create(organizationId: string, dto: CreateLrDto) {
    const formattedLrNo = dto.lrNumber.replace(/\s+/g, '').toUpperCase();

    // Verify shipment
    const shipment = await this.shipmentModel.findOne({
      where: {
        id: dto.shipmentId,
        organizationId,
      },
    });

    if (!shipment) {
      throw new BadRequestException(
        `Shipment with ID '${dto.shipmentId}' not found in your organization`,
      );
    }

    const basicFreight = dto.basicFreight || 0;
    const otherCharges = dto.otherCharges || 0;
    const taxAmount = dto.taxAmount || 0;
    const totalAmount = basicFreight + otherCharges + taxAmount;

    try {
      const lr = await this.lrModel.create({
        organizationId,
        shipmentId: dto.shipmentId,
        lrNumber: formattedLrNo,
        consignorName: dto.consignorName,
        consignorAddress: dto.consignorAddress,
        consigneeName: dto.consigneeName,
        consigneeAddress: dto.consigneeAddress,
        freightTerms: dto.freightTerms,
        basicFreight,
        otherCharges,
        taxAmount,
        totalAmount,
        remarks: dto.remarks,
        status: dto.status,
      } as any);

      return this.findOne(organizationId, lr.id);
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException(
          `Lorry Receipt with number '${formattedLrNo}' already exists in your organization`,
        );
      }
      throw error;
    }
  }

  async findAll(organizationId: string, query: QueryLrDto) {
    const { search, status, freightTerms, shipmentId, page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const where: any = { organizationId };

    if (status) where.status = status;
    if (freightTerms) where.freightTerms = freightTerms;
    if (shipmentId) where.shipmentId = shipmentId;

    if (search) {
      where[Op.or] = [
        { lrNumber: { [Op.iLike]: `%${search}%` } },
        { consignorName: { [Op.iLike]: `%${search}%` } },
        { consigneeName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows: data, count: total } = await this.lrModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Shipment, as: 'shipment' },
      ],
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
    const lr = await this.lrModel.findOne({
      where: { id, organizationId },
      include: [
        { model: Shipment, as: 'shipment' },
      ],
    });

    if (!lr) {
      throw new NotFoundException(`Lorry Receipt with ID '${id}' not found`);
    }

    return lr;
  }

  async update(organizationId: string, id: string, dto: UpdateLrDto) {
    const current = await this.findOne(organizationId, id);

    let formattedLrNo: string | undefined;

    if (dto.lrNumber) {
      formattedLrNo = dto.lrNumber.replace(/\s+/g, '').toUpperCase();
    }

    if (dto.shipmentId) {
      const shipment = await this.shipmentModel.findOne({
        where: { id: dto.shipmentId, organizationId },
      });
      if (!shipment) {
        throw new BadRequestException(
          `Shipment with ID '${dto.shipmentId}' not found in your organization`,
        );
      }
    }

    const basicFreight = dto.basicFreight !== undefined ? dto.basicFreight : current.basicFreight;
    const otherCharges = dto.otherCharges !== undefined ? dto.otherCharges : current.otherCharges;
    const taxAmount = dto.taxAmount !== undefined ? dto.taxAmount : current.taxAmount;
    const totalAmount = basicFreight + otherCharges + taxAmount;

    try {
      const data: any = {};
      if (formattedLrNo) data.lrNumber = formattedLrNo;
      if (dto.shipmentId) data.shipmentId = dto.shipmentId;
      if (dto.consignorName) data.consignorName = dto.consignorName;
      if (dto.consignorAddress !== undefined) data.consignorAddress = dto.consignorAddress;
      if (dto.consigneeName) data.consigneeName = dto.consigneeName;
      if (dto.consigneeAddress !== undefined) data.consigneeAddress = dto.consigneeAddress;
      if (dto.freightTerms) data.freightTerms = dto.freightTerms;
      if (dto.basicFreight !== undefined) data.basicFreight = dto.basicFreight;
      if (dto.otherCharges !== undefined) data.otherCharges = dto.otherCharges;
      if (dto.taxAmount !== undefined) data.taxAmount = dto.taxAmount;
      data.totalAmount = totalAmount;
      if (dto.remarks !== undefined) data.remarks = dto.remarks;
      if (dto.status) data.status = dto.status;

      await this.lrModel.update(data, {
        where: { id, organizationId },
      });

      return this.findOne(organizationId, id);
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException(
          `Lorry Receipt with number '${formattedLrNo}' already exists in your organization`,
        );
      }
      throw error;
    }
  }

  async remove(organizationId: string, id: string) {
    const lr = await this.findOne(organizationId, id);

    await lr.destroy();

    return { message: 'Lorry Receipt deleted successfully' };
  }
}
