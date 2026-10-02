import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Vehicle } from './models/vehicle.model';
import { VehicleType } from '../vehicle-types/models/vehicle-types.model';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { QueryVehicleDto } from './dto/query-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectModel(Vehicle) private vehicleModel: typeof Vehicle,
    @InjectModel(VehicleType) private vehicleTypeModel: typeof VehicleType,
  ) {}

  async create(organizationId: string, dto: CreateVehicleDto) {
    const formattedRegNo = dto.registrationNumber.replace(/\s+/g, '').toUpperCase();

    const vehicleType = await this.vehicleTypeModel.findOne({
      where: {
        id: dto.vehicleTypeId,
        organizationId,
      },
    });

    if (!vehicleType) {
      throw new BadRequestException(
        `Vehicle type with ID '${dto.vehicleTypeId}' does not exist in your organization`,
      );
    }

    const existing = await this.vehicleModel.findOne({
      where: {
        organizationId,
        registrationNumber: formattedRegNo,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Vehicle with registration number '${formattedRegNo}' already exists in your organization`,
      );
    }

    return this.vehicleModel.create({
      organizationId,
      vehicleTypeId: dto.vehicleTypeId,
      registrationNumber: formattedRegNo,
      chassisNumber: dto.chassisNumber,
      engineNumber: dto.engineNumber,
      make: dto.make,
      model: dto.model,
      year: dto.year,
      status: dto.status,
      ownershipType: dto.ownershipType,
      currentOdometer: dto.currentOdometer || 0,
    } as any);
  }

  async findAll(organizationId: string, query: QueryVehicleDto) {
    const { search, status, ownershipType, vehicleTypeId, page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const where: any = { organizationId };
    
    if (status) where.status = status;
    if (ownershipType) where.ownershipType = ownershipType;
    if (vehicleTypeId) where.vehicleTypeId = vehicleTypeId;
    
    if (search) {
      where[Op.or] = [
        { registrationNumber: { [Op.iLike]: `%${search}%` } },
        { make: { [Op.iLike]: `%${search}%` } },
        { model: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows: data, count: total } = await this.vehicleModel.findAndCountAll({
      where,
      offset,
      limit,
      order: [['createdAt', 'DESC']],
      include: [{ model: VehicleType, as: 'vehicleType' }],
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
    const vehicle = await this.vehicleModel.findOne({
      where: {
        id,
        organizationId,
      },
      include: [{ model: VehicleType, as: 'vehicleType' }],
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID '${id}' not found`);
    }

    return vehicle;
  }

  async update(organizationId: string, id: string, dto: UpdateVehicleDto) {
    const vehicle = await this.findOne(organizationId, id);

    let formattedRegNo: string | undefined;

    if (dto.registrationNumber) {
      formattedRegNo = dto.registrationNumber.replace(/\s+/g, '').toUpperCase();
      const duplicate = await this.vehicleModel.findOne({
        where: {
          organizationId,
          registrationNumber: formattedRegNo,
          id: { [Op.ne]: id },
        },
      });

      if (duplicate) {
        throw new ConflictException(
          `Vehicle with registration number '${formattedRegNo}' already exists in your organization`,
        );
      }
    }

    if (dto.vehicleTypeId) {
      const vehicleType = await this.vehicleTypeModel.findOne({
        where: {
          id: dto.vehicleTypeId,
          organizationId,
        },
      });

      if (!vehicleType) {
        throw new BadRequestException(
          `Vehicle type with ID '${dto.vehicleTypeId}' does not exist in your organization`,
        );
      }
    }

    await vehicle.update({
      ...(dto.vehicleTypeId && { vehicleTypeId: dto.vehicleTypeId }),
      ...(formattedRegNo && { registrationNumber: formattedRegNo }),
      ...(dto.chassisNumber !== undefined && { chassisNumber: dto.chassisNumber }),
      ...(dto.engineNumber !== undefined && { engineNumber: dto.engineNumber }),
      ...(dto.make !== undefined && { make: dto.make }),
      ...(dto.model !== undefined && { model: dto.model }),
      ...(dto.year !== undefined && { year: dto.year }),
      ...(dto.status && { status: dto.status }),
      ...(dto.ownershipType && { ownershipType: dto.ownershipType }),
      ...(dto.currentOdometer !== undefined && { currentOdometer: dto.currentOdometer }),
    });

    return this.findOne(organizationId, id);
  }

  async remove(organizationId: string, id: string) {
    const vehicle = await this.findOne(organizationId, id);
    await vehicle.destroy();
    return { message: 'Vehicle deleted successfully' };
  }
}
