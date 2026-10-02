import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { TrackingEvent } from './models/tracking-event.model';
import { Trip } from '../trips/models/trip.model';
import { Vehicle } from '../vehicles/models/vehicle.model';
import { CreateTrackingEventDto } from './dto/create-tracking-event.dto';
import { QueryTrackingEventDto } from './dto/query-tracking-event.dto';

@Injectable()
export class TrackingEventsService {
  constructor(
    @InjectModel(TrackingEvent) private readonly eventModel: typeof TrackingEvent,
    @InjectModel(Trip) private readonly tripModel: typeof Trip,
    @InjectModel(Vehicle) private readonly vehicleModel: typeof Vehicle,
  ) {}

  async create(organizationId: string, dto: CreateTrackingEventDto) {
    if (!dto.tripId && !dto.vehicleId) {
      throw new BadRequestException('At least one of tripId or vehicleId must be provided');
    }

    if (dto.tripId) {
      const trip = await this.tripModel.findOne({ where: { id: dto.tripId, organizationId } });
      if (!trip) {
        throw new BadRequestException(`Trip with ID '${dto.tripId}' not found in your organization`);
      }
    }

    if (dto.vehicleId) {
      const vehicle = await this.vehicleModel.findOne({ where: { id: dto.vehicleId, organizationId } });
      if (!vehicle) {
        throw new BadRequestException(`Vehicle with ID '${dto.vehicleId}' not found in your organization`);
      }
    }

    return this.eventModel.create({
      organizationId,
      ...dto,
      eventTime: new Date(dto.eventTime),
      source: dto.source || 'SYSTEM',
    } as any);
  }

  async findAll(organizationId: string, query: QueryTrackingEventDto) {
    const { tripId, vehicleId, eventType, startTime, endTime, page = '1', limit = '10' } = query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    const where: any = { organizationId };

    if (tripId) where.tripId = tripId;
    if (vehicleId) where.vehicleId = vehicleId;
    if (eventType) where.eventType = eventType;

    if (startTime || endTime) {
      where.eventTime = {};
      if (startTime) where.eventTime[Op.gte] = new Date(startTime);
      if (endTime) where.eventTime[Op.lte] = new Date(endTime);
    }

    const { rows: data, count: total } = await this.eventModel.findAndCountAll({
      where,
      limit: limitNum,
      offset,
      order: [['eventTime', 'DESC']],
      include: [
        { model: Trip, as: 'trip' },
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
}
