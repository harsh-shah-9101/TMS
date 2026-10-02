import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { VehicleType } from './models/vehicle-types.model';
import { CreateVehicleTypeDto } from './dto/create-vehicle-type.dto';
import { UpdateVehicleTypeDto } from './dto/update-vehicle-type.dto';
import { QueryVehicleTypeDto } from './dto/query-vehicle-type.dto';

@Injectable()
export class VehicleTypesService {
  constructor(
    @InjectModel(VehicleType) private vehicleTypeModel: typeof VehicleType,
  ) {}

  async create(organizationId: string, dto: CreateVehicleTypeDto) {
    const existing = await this.vehicleTypeModel.findOne({
      where: {
        organizationId,
        code: dto.code.toUpperCase(),
      },
    });

    if (existing) {
      throw new ConflictException(
        `Vehicle type with code '${dto.code.toUpperCase()}' already exists in your organization`,
      );
    }

    return this.vehicleTypeModel.create({
      organizationId,
      name: dto.name,
      code: dto.code.toUpperCase(),
      capacityTons: dto.capacityTons,
      volumeCuFt: dto.volumeCuFt,
      axleCount: dto.axleCount,
      fuelType: dto.fuelType,
      status: dto.status,
    } as any);
  }

  async findAll(organizationId: string, query: QueryVehicleTypeDto) {
    const { search, status, fuelType, page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const where: any = { organizationId };

    if (status) where.status = status;
    if (fuelType) where.fuelType = fuelType;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows: data, count: total } = await this.vehicleTypeModel.findAndCountAll({
      where,
      offset,
      limit,
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
    const vehicleType = await this.vehicleTypeModel.findOne({
      where: {
        id,
        organizationId,
      },
    });

    if (!vehicleType) {
      throw new NotFoundException(`Vehicle type with ID '${id}' not found`);
    }

    return vehicleType;
  }

  async update(organizationId: string, id: string, dto: UpdateVehicleTypeDto) {
    const vehicleType = await this.findOne(organizationId, id);

    if (dto.code) {
      const duplicateCode = await this.vehicleTypeModel.findOne({
        where: {
          organizationId,
          code: dto.code.toUpperCase(),
          id: { [Op.ne]: id },
        },
      });

      if (duplicateCode) {
        throw new ConflictException(
          `Vehicle type with code '${dto.code.toUpperCase()}' already exists in your organization`,
        );
      }
    }

    await vehicleType.update({
      ...(dto.name && { name: dto.name }),
      ...(dto.code && { code: dto.code.toUpperCase() }),
      ...(dto.capacityTons !== undefined && { capacityTons: dto.capacityTons }),
      ...(dto.volumeCuFt !== undefined && { volumeCuFt: dto.volumeCuFt }),
      ...(dto.axleCount !== undefined && { axleCount: dto.axleCount }),
      ...(dto.fuelType && { fuelType: dto.fuelType }),
      ...(dto.status && { status: dto.status }),
    });

    return this.findOne(organizationId, id);
  }

  async remove(organizationId: string, id: string) {
    const vehicleType = await this.findOne(organizationId, id);
    await vehicleType.destroy();
    return { message: 'Vehicle type deleted successfully' };
  }
}
