import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Customer } from './models/customer.model';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer)
    private readonly customerModel: typeof Customer,
  ) {}

  async create(organizationId: string, dto: CreateCustomerDto) {
    const formattedCode = dto.code.toUpperCase();

    try {
      const data: any = {
        organizationId,
        name: dto.name,
        code: formattedCode,
      };

      if (dto.type) data.type = dto.type;
      if (dto.gstin) data.gstin = dto.gstin.toUpperCase();
      if (dto.pan) data.pan = dto.pan.toUpperCase();
      if (dto.email) data.email = dto.email.toLowerCase();
      if (dto.phone) data.phone = dto.phone;
      if (dto.addressLine1) data.addressLine1 = dto.addressLine1;
      if (dto.addressLine2) data.addressLine2 = dto.addressLine2;
      if (dto.city) data.city = dto.city;
      if (dto.state) data.state = dto.state;
      if (dto.pincode) data.pincode = dto.pincode;
      if (dto.status) data.status = dto.status;

      const customer = await this.customerModel.create(data);
      return customer;
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException(
          `Customer with code '${formattedCode}' already exists in your organization`,
        );
      }
      throw error;
    }
  }

  async findAll(organizationId: string, query: QueryCustomerDto) {
    const { search, type, status, page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const where: any = { organizationId };

    if (type) where.type = type;
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

    const { rows: data, count: total } = await this.customerModel.findAndCountAll({
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
    const customer = await this.customerModel.findOne({
      where: { id, organizationId },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID '${id}' not found`);
    }

    return customer;
  }

  async update(organizationId: string, id: string, dto: UpdateCustomerDto) {
    await this.findOne(organizationId, id);

    let formattedCode: string | undefined;
    if (dto.code) {
      formattedCode = dto.code.toUpperCase();
    }

    try {
      const data: any = {};
      if (dto.name) data.name = dto.name;
      if (formattedCode) data.code = formattedCode;
      if (dto.type) data.type = dto.type;
      if (dto.gstin !== undefined) data.gstin = dto.gstin ? dto.gstin.toUpperCase() : null;
      if (dto.pan !== undefined) data.pan = dto.pan ? dto.pan.toUpperCase() : null;
      if (dto.email !== undefined) data.email = dto.email ? dto.email.toLowerCase() : null;
      if (dto.phone !== undefined) data.phone = dto.phone;
      if (dto.addressLine1 !== undefined) data.addressLine1 = dto.addressLine1;
      if (dto.addressLine2 !== undefined) data.addressLine2 = dto.addressLine2;
      if (dto.city !== undefined) data.city = dto.city;
      if (dto.state !== undefined) data.state = dto.state;
      if (dto.pincode !== undefined) data.pincode = dto.pincode;
      if (dto.status) data.status = dto.status;

      const [affectedCount, affectedRows] = await this.customerModel.update(data, {
        where: { id, organizationId },
        returning: true,
      });

      return affectedRows[0];
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException(
          `Customer with code '${formattedCode}' already exists in your organization`,
        );
      }
      throw error;
    }
  }

  async remove(organizationId: string, id: string) {
    const customer = await this.findOne(organizationId, id);
    
    // Sequelize paranoid option handles setting deletedAt
    await customer.destroy();

    return { message: 'Customer deleted successfully' };
  }
}
