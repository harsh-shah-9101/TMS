import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Carrier } from './models/carrier.model';
import { CreateCarrierDto } from './dto/create-carrier.dto';
import { UpdateCarrierDto } from './dto/update-carrier.dto';
import { QueryCarrierDto } from './dto/query-carrier.dto';

@Injectable()
export class CarriersService {
  constructor(
    @InjectModel(Carrier)
    private readonly carrierModel: typeof Carrier,
  ) {}

  async create(organizationId: string, dto: CreateCarrierDto) {
    const formattedCode = dto.code.toUpperCase();

    try {
      const data: any = {
        organizationId,
        name: dto.name,
        code: formattedCode,
      };

      if (dto.gstin) data.gstin = dto.gstin.toUpperCase();
      if (dto.pan) data.pan = dto.pan.toUpperCase();
      if (dto.email) data.email = dto.email.toLowerCase();
      if (dto.phone) data.phone = dto.phone;
      if (dto.addressLine1) data.addressLine1 = dto.addressLine1;
      if (dto.city) data.city = dto.city;
      if (dto.state) data.state = dto.state;
      if (dto.pincode) data.pincode = dto.pincode;
      if (dto.rating !== undefined) data.rating = dto.rating;
      if (dto.status) data.status = dto.status;

      const carrier = await this.carrierModel.create(data);
      return carrier;
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException(
          `Carrier with code '${formattedCode}' already exists in your organization`,
        );
      }
      throw error;
    }
  }

  async findAll(organizationId: string, query: QueryCarrierDto) {
    const { search, status, page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const where: any = { organizationId };

    if (status) where.status = status;

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
        { gstin: { [Op.iLike]: `%${search}%` } },
        { city: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows: data, count: total } = await this.carrierModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
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
    const carrier = await this.carrierModel.findOne({
      where: { id, organizationId },
    });

    if (!carrier) {
      throw new NotFoundException(`Carrier with ID '${id}' not found`);
    }

    return carrier;
  }

  async update(organizationId: string, id: string, dto: UpdateCarrierDto) {
    await this.findOne(organizationId, id);

    let formattedCode: string | undefined;
    if (dto.code) {
      formattedCode = dto.code.toUpperCase();
    }

    try {
      const data: any = {};
      if (dto.name) data.name = dto.name;
      if (formattedCode) data.code = formattedCode;
      if (dto.gstin !== undefined) data.gstin = dto.gstin ? dto.gstin.toUpperCase() : null;
      if (dto.pan !== undefined) data.pan = dto.pan ? dto.pan.toUpperCase() : null;
      if (dto.email !== undefined) data.email = dto.email ? dto.email.toLowerCase() : null;
      if (dto.phone !== undefined) data.phone = dto.phone;
      if (dto.addressLine1 !== undefined) data.addressLine1 = dto.addressLine1;
      if (dto.city !== undefined) data.city = dto.city;
      if (dto.state !== undefined) data.state = dto.state;
      if (dto.pincode !== undefined) data.pincode = dto.pincode;
      if (dto.rating !== undefined) data.rating = dto.rating;
      if (dto.status) data.status = dto.status;

      const [affectedCount, affectedRows] = await this.carrierModel.update(data, {
        where: { id, organizationId },
        returning: true,
      });

      return affectedRows[0];
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException(
          `Carrier with code '${formattedCode}' already exists in your organization`,
        );
      }
      throw error;
    }
  }

  async remove(organizationId: string, id: string) {
    const carrier = await this.findOne(organizationId, id);
    
    // Sequelize paranoid option handles setting deletedAt
    await carrier.destroy();

    return { message: 'Carrier deleted successfully' };
  }
}
