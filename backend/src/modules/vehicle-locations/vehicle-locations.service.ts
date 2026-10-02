import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { VehicleLocation } from './models/vehicle-location.model';
import { Vehicle } from '../vehicles/models/vehicle.model';
import { CreateVehicleLocationDto } from './dto/create-vehicle-location.dto';
import { QueryVehicleLocationDto } from './dto/query-vehicle-location.dto';

@Injectable()
export class VehicleLocationsService {
  constructor(
    @InjectModel(VehicleLocation) private readonly locationModel: typeof VehicleLocation,
    @InjectModel(Vehicle) private readonly vehicleModel: typeof Vehicle,
  ) {}

  async create(organizationId: string, dto: CreateVehicleLocationDto) {
    const vehicle = await this.vehicleModel.findOne({
      where: { id: dto.vehicleId, organizationId },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID '${dto.vehicleId}' not found in your organization`);
    }

    return this.locationModel.create({
      organizationId,
      vehicleId: dto.vehicleId,
      latitude: dto.latitude,
      longitude: dto.longitude,
      speed: dto.speed,
      heading: dto.heading,
      recordedAt: new Date(dto.recordedAt),
      source: dto.source || 'GPS_DEVICE',
    } as any);
  }

  async findAll(organizationId: string, query: QueryVehicleLocationDto) {
    const { vehicleId, startTime, endTime, page = '1', limit = '10' } = query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    const where: any = { organizationId };

    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    if (startTime || endTime) {
      where.recordedAt = {};
      if (startTime) where.recordedAt[Op.gte] = new Date(startTime);
      if (endTime) where.recordedAt[Op.lte] = new Date(endTime);
    }

    const { rows: data, count: total } = await this.locationModel.findAndCountAll({
      where,
      limit: limitNum,
      offset,
      order: [['recordedAt', 'DESC']],
      include: [
        { model: Vehicle, as: 'vehicle' }
      ]
    });

    return {
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async getLatestLocation(organizationId: string, vehicleId: string) {
    const location = await this.locationModel.findOne({
      where: { organizationId, vehicleId },
      order: [['recordedAt', 'DESC']],
      include: [{ model: Vehicle, as: 'vehicle' }]
    });

    if (!location) {
      throw new NotFoundException(`No location found for vehicle '${vehicleId}'`);
    }

    return location;
  }
}
