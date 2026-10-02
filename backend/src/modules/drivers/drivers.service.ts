import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Driver } from './models/driver.model';
import { User } from '../users/models/user.model';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { QueryDriverDto } from './dto/query-driver.dto';

@Injectable()
export class DriversService {
  constructor(
    @InjectModel(Driver) private driverModel: typeof Driver,
    @InjectModel(User) private userModel: typeof User,
  ) {}

  async create(organizationId: string, dto: CreateDriverDto) {
    const formattedLicense = dto.licenseNumber.replace(/\s+/g, '').toUpperCase();

    const existing = await this.driverModel.findOne({
      where: {
        organizationId,
        licenseNumber: formattedLicense,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Driver with license number '${formattedLicense}' already exists in your organization`,
      );
    }

    if (dto.userId) {
      const user = await this.userModel.findOne({
        where: {
          id: dto.userId,
          organizationId,
        },
      });

      if (!user) {
        throw new BadRequestException(
          `User with ID '${dto.userId}' not found in your organization`,
        );
      }
    }

    return this.driverModel.create({
      organizationId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      licenseNumber: formattedLicense,
      licenseCategory: dto.licenseCategory,
      licenseExpiry: (dto.licenseExpiry ? new Date(dto.licenseExpiry) : null) as any,
      userId: dto.userId,
      status: dto.status,
    } as any);
  }

  async findAll(organizationId: string, query: QueryDriverDto) {
    const { search, status, page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const where: any = { organizationId };

    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { licenseNumber: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows: data, count: total } = await this.driverModel.findAndCountAll({
      where,
      offset,
      limit,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'status'],
        },
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
    const driver = await this.driverModel.findOne({
      where: {
        id,
        organizationId,
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'status'],
        },
      ],
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID '${id}' not found`);
    }

    return driver;
  }

  async update(organizationId: string, id: string, dto: UpdateDriverDto) {
    const driver = await this.findOne(organizationId, id);

    let formattedLicense: string | undefined;

    if (dto.licenseNumber) {
      formattedLicense = dto.licenseNumber.replace(/\s+/g, '').toUpperCase();
      const duplicate = await this.driverModel.findOne({
        where: {
          organizationId,
          licenseNumber: formattedLicense,
          id: { [Op.ne]: id },
        },
      });

      if (duplicate) {
        throw new ConflictException(
          `Driver with license number '${formattedLicense}' already exists in your organization`,
        );
      }
    }

    if (dto.userId) {
      const user = await this.userModel.findOne({
        where: {
          id: dto.userId,
          organizationId,
        },
      });

      if (!user) {
        throw new BadRequestException(
          `User with ID '${dto.userId}' not found in your organization`,
        );
      }
    }

    await driver.update({
      ...(dto.firstName && { firstName: dto.firstName }),
      ...(dto.lastName && { lastName: dto.lastName }),
      ...(dto.phone && { phone: dto.phone }),
      ...(formattedLicense && { licenseNumber: formattedLicense }),
      ...(dto.licenseCategory !== undefined && { licenseCategory: dto.licenseCategory }),
      ...(dto.licenseExpiry !== undefined && {
        licenseExpiry: (dto.licenseExpiry ? new Date(dto.licenseExpiry) : null) as any,
      }),
      ...(dto.userId !== undefined && { userId: dto.userId }),
      ...(dto.status && { status: dto.status }),
    });

    return this.findOne(organizationId, id);
  }

  async remove(organizationId: string, id: string) {
    const driver = await this.findOne(organizationId, id);
    await driver.destroy();
    return { message: 'Driver deleted successfully' };
  }
}
