import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Dispatch } from './models/dispatch.model';
import { Trip } from '../trips/models/trip.model';
import { Vehicle } from '../vehicles/models/vehicle.model';
import { Driver } from '../drivers/models/driver.model';
import { Route } from '../routes/models/route.model';
import { TripStop } from '../trips/models/trip-stop.model';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { UpdateDispatchStatusDto } from './dto/update-dispatch-status.dto';
import { QueryDispatchDto } from './dto/query-dispatch.dto';
import { DispatchStatus, TripStatus, VehicleStatus, DriverStatus } from '@prisma/client';

@Injectable()
export class DispatchService {
  constructor(
    @InjectModel(Dispatch) private readonly dispatchModel: typeof Dispatch,
    @InjectModel(Trip) private readonly tripModel: typeof Trip,
    @InjectModel(Vehicle) private readonly vehicleModel: typeof Vehicle,
    @InjectModel(Driver) private readonly driverModel: typeof Driver,
  ) {}

  async create(organizationId: string, userId: string, dto: CreateDispatchDto) {
    const formattedDispatchNo = dto.dispatchNumber.replace(/\s+/g, '').toUpperCase();

    try {
      const trip = await this.tripModel.findOne({
        where: { id: dto.tripId, organizationId },
        include: [
          { model: Vehicle, as: 'vehicle' },
          { model: Driver, as: 'driver' },
        ],
      });

      if (!trip) {
        throw new NotFoundException(`Trip with ID '${dto.tripId}' not found in your organization`);
      }

      const dispatch = await this.dispatchModel.create({
        organizationId,
        tripId: dto.tripId,
        dispatchNumber: formattedDispatchNo,
        gatePassNumber: dto.gatePassNumber,
        status: dto.status || DispatchStatus.DISPATCHED,
        dispatchedByUserId: userId,
        remarks: dto.remarks,
      } as any);

      // Automatically advance trip status to DISPATCHED
      await this.tripModel.update(
        {
          status: TripStatus.DISPATCHED,
          actualStartDate: trip.actualStartDate || new Date(),
        },
        { where: { id: dto.tripId } }
      );

      // Update vehicle status
      if (trip.vehicleId) {
        await this.vehicleModel.update(
          { status: VehicleStatus.IN_TRANSIT },
          { where: { id: trip.vehicleId } }
        );
      }

      // Update driver status
      if (trip.driverId) {
        await this.driverModel.update(
          { status: DriverStatus.ON_TRIP },
          { where: { id: trip.driverId } }
        );
      }

      return this.findOne(organizationId, dispatch.id);
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException(
          `Dispatch record with number '${formattedDispatchNo}' already exists in your organization`,
        );
      }
      throw error;
    }
  }

  async findAll(organizationId: string, query: QueryDispatchDto) {
    const { search, status, tripId, page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const where: any = { organizationId };

    if (status) where.status = status;
    if (tripId) where.tripId = tripId;

    if (search) {
      where[Op.or] = [
        { dispatchNumber: { [Op.iLike]: `%${search}%` } },
        { gatePassNumber: { [Op.iLike]: `%${search}%` } },
        { remarks: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows: data, count: total } = await this.dispatchModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Trip,
          as: 'trip',
          include: [
            { model: Vehicle, as: 'vehicle' },
            { model: Driver, as: 'driver' },
            { model: Route, as: 'route' },
          ],
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
    const dispatch = await this.dispatchModel.findOne({
      where: { id, organizationId },
      include: [
        {
          model: Trip,
          as: 'trip',
          include: [
            { model: Vehicle, as: 'vehicle' },
            { model: Driver, as: 'driver' },
            { model: Route, as: 'route' },
            { model: TripStop, as: 'stops' },
          ],
        },
      ],
      order: [
        [{ model: Trip, as: 'trip' }, { model: TripStop, as: 'stops' }, 'sequence', 'ASC'],
      ],
    });

    if (!dispatch) {
      throw new NotFoundException(`Dispatch record with ID '${id}' not found`);
    }

    return dispatch;
  }

  async updateStatus(organizationId: string, id: string, dto: UpdateDispatchStatusDto) {
    const dispatch = await this.findOne(organizationId, id);

    const updateData: any = { status: dto.status };
    if (dto.remarks) updateData.remarks = dto.remarks;

    await this.dispatchModel.update(updateData, { where: { id } });

    if (dto.status === DispatchStatus.CANCELLED) {
      await this.tripModel.update(
        { status: TripStatus.PLANNED },
        { where: { id: dispatch.tripId } }
      );
    } else if (dto.status === DispatchStatus.GATE_OUT) {
      await this.tripModel.update(
        { status: TripStatus.IN_TRANSIT },
        { where: { id: dispatch.tripId } }
      );
    }

    return this.findOne(organizationId, id);
  }
}
