import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Trip } from './models/trip.model';
import { TripStop } from './models/trip-stop.model';
import { Route } from '../routes/models/route.model';
import { Vehicle } from '../vehicles/models/vehicle.model';
import { Driver } from '../drivers/models/driver.model';
import { Carrier } from '../carriers/models/carrier.model';
import { Shipment } from '../shipments/models/shipment.model';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { UpdateTripStatusDto } from './dto/update-trip-status.dto';
import { QueryTripDto } from './dto/query-trip.dto';
import { CreateTripStopDto } from './dto/create-trip-stop.dto';
import { UpdateTripStopStatusDto } from './dto/update-trip-stop-status.dto';
import { TripStatus, VehicleStatus, DriverStatus } from '../../common/enums';

@Injectable()
export class TripsService {
  constructor(
    @InjectModel(Trip) private readonly tripModel: typeof Trip,
    @InjectModel(TripStop) private readonly tripStopModel: typeof TripStop,
    @InjectModel(Route) private readonly routeModel: typeof Route,
    @InjectModel(Vehicle) private readonly vehicleModel: typeof Vehicle,
    @InjectModel(Driver) private readonly driverModel: typeof Driver,
    @InjectModel(Carrier) private readonly carrierModel: typeof Carrier,
    @InjectModel(Shipment) private readonly shipmentModel: typeof Shipment,
  ) {}

  private readonly allowedTransitions: Record<string, string[]> = {
    [TripStatus.PLANNED]: [TripStatus.ASSIGNED, TripStatus.CANCELLED],
    [TripStatus.ASSIGNED]: [TripStatus.DISPATCHED, TripStatus.IN_TRANSIT, TripStatus.CANCELLED],
    [TripStatus.DISPATCHED]: [TripStatus.IN_TRANSIT, TripStatus.PAUSED, TripStatus.CANCELLED],
    [TripStatus.IN_TRANSIT]: [TripStatus.PAUSED, TripStatus.COMPLETED, TripStatus.CANCELLED],
    [TripStatus.PAUSED]: [TripStatus.IN_TRANSIT, TripStatus.COMPLETED, TripStatus.CANCELLED],
    [TripStatus.COMPLETED]: [],
    [TripStatus.CANCELLED]: [],
  };

  async create(organizationId: string, dto: CreateTripDto) {
    const formattedTripNo = dto.tripNumber.replace(/\s+/g, '').toUpperCase();

    if (dto.routeId) {
      const route = await this.routeModel.findOne({
        where: { id: dto.routeId, organizationId },
      });
      if (!route) {
        throw new BadRequestException(`Route with ID '${dto.routeId}' not found in your organization`);
      }
    }

    if (dto.vehicleId) {
      const vehicle = await this.vehicleModel.findOne({
        where: { id: dto.vehicleId, organizationId },
      });
      if (!vehicle) {
        throw new BadRequestException(`Vehicle with ID '${dto.vehicleId}' not found in your organization`);
      }
    }

    if (dto.driverId) {
      const driver = await this.driverModel.findOne({
        where: { id: dto.driverId, organizationId },
      });
      if (!driver) {
        throw new BadRequestException(`Driver with ID '${dto.driverId}' not found in your organization`);
      }
    }

    if (dto.carrierId) {
      const carrier = await this.carrierModel.findOne({
        where: { id: dto.carrierId, organizationId },
      });
      if (!carrier) {
        throw new BadRequestException(`Carrier with ID '${dto.carrierId}' not found in your organization`);
      }
    }

    let stopsToCreate: any[] = [];
    if (dto.stops && dto.stops.length > 0) {
      for (let i = 0; i < dto.stops.length; i++) {
        const stop = dto.stops[i];
        if (stop.shipmentId) {
          const shipment = await this.shipmentModel.findOne({
            where: { id: stop.shipmentId, organizationId },
          });
          if (!shipment) {
            throw new BadRequestException(`Shipment with ID '${stop.shipmentId}' not found in your organization`);
          }
        }
        stopsToCreate.push({
          sequence: stop.sequence || i + 1,
          shipmentId: stop.shipmentId,
          stopType: stop.stopType,
          locationName: stop.locationName,
          city: stop.city,
          pincode: stop.pincode,
          status: stop.status,
          remarks: stop.remarks,
        });
      }
    }

    try {
      const trip = await this.tripModel.create({
        organizationId,
        tripNumber: formattedTripNo,
        routeId: dto.routeId,
        vehicleId: dto.vehicleId,
        driverId: dto.driverId,
        carrierId: dto.carrierId,
        status: dto.status || TripStatus.PLANNED,
        plannedStartDate: dto.plannedStartDate ? new Date(dto.plannedStartDate) : null,
        plannedEndDate: dto.plannedEndDate ? new Date(dto.plannedEndDate) : null,
        startOdometer: dto.startOdometer,
        endOdometer: dto.endOdometer,
        remarks: dto.remarks,
        stops: stopsToCreate,
      } as any, {
        include: [{ model: TripStop, as: 'stops' }],
      });

      // Update vehicle/driver status if assigned
      if (dto.vehicleId) {
        await this.vehicleModel.update(
          { status: VehicleStatus.ASSIGNED },
          { where: { id: dto.vehicleId } }
        );
      }

      if (dto.driverId) {
        await this.driverModel.update(
          { status: DriverStatus.ASSIGNED },
          { where: { id: dto.driverId } }
        );
      }

      return this.findOne(organizationId, trip.id);
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException(
          `Trip with trip number '${formattedTripNo}' already exists in your organization`,
        );
      }
      throw error;
    }
  }

  async findAll(organizationId: string, query: QueryTripDto) {
    const { search, status, vehicleId, driverId, carrierId, routeId, page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const where: any = { organizationId };

    if (status) where.status = status;
    if (vehicleId) where.vehicleId = vehicleId;
    if (driverId) where.driverId = driverId;
    if (carrierId) where.carrierId = carrierId;
    if (routeId) where.routeId = routeId;

    if (search) {
      where[Op.or] = [
        { tripNumber: { [Op.iLike]: `%${search}%` } },
        { remarks: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows: data, count: total } = await this.tripModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Route, as: 'route' },
        { model: Vehicle, as: 'vehicle' },
        { model: Driver, as: 'driver' },
        { model: Carrier, as: 'carrier' },
        {
          model: TripStop,
          as: 'stops',
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
    const trip = await this.tripModel.findOne({
      where: { id, organizationId },
      include: [
        { model: Route, as: 'route' },
        { model: Vehicle, as: 'vehicle' },
        { model: Driver, as: 'driver' },
        { model: Carrier, as: 'carrier' },
        {
          model: TripStop,
          as: 'stops',
          include: [{ model: Shipment, as: 'shipment' }],
        },
      ],
      order: [
        [{ model: TripStop, as: 'stops' }, 'sequence', 'ASC'],
      ],
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID '${id}' not found`);
    }

    return trip;
  }

  async update(organizationId: string, id: string, dto: UpdateTripDto) {
    const existingTrip = await this.findOne(organizationId, id);

    let formattedTripNo: string | undefined;

    if (dto.tripNumber) {
      formattedTripNo = dto.tripNumber.replace(/\s+/g, '').toUpperCase();
    }

    if (dto.routeId) {
      const route = await this.routeModel.findOne({
        where: { id: dto.routeId, organizationId },
      });
      if (!route) {
        throw new BadRequestException(`Route with ID '${dto.routeId}' not found in your organization`);
      }
    }

    if (dto.vehicleId) {
      const vehicle = await this.vehicleModel.findOne({
        where: { id: dto.vehicleId, organizationId },
      });
      if (!vehicle) {
        throw new BadRequestException(`Vehicle with ID '${dto.vehicleId}' not found in your organization`);
      }
    }

    if (dto.driverId) {
      const driver = await this.driverModel.findOne({
        where: { id: dto.driverId, organizationId },
      });
      if (!driver) {
        throw new BadRequestException(`Driver with ID '${dto.driverId}' not found in your organization`);
      }
    }

    if (dto.carrierId) {
      const carrier = await this.carrierModel.findOne({
        where: { id: dto.carrierId, organizationId },
      });
      if (!carrier) {
        throw new BadRequestException(`Carrier with ID '${dto.carrierId}' not found in your organization`);
      }
    }

    try {
      const updateData: any = {};
      if (formattedTripNo) updateData.tripNumber = formattedTripNo;
      if (dto.routeId !== undefined) updateData.routeId = dto.routeId;
      if (dto.vehicleId !== undefined) updateData.vehicleId = dto.vehicleId;
      if (dto.driverId !== undefined) updateData.driverId = dto.driverId;
      if (dto.carrierId !== undefined) updateData.carrierId = dto.carrierId;
      if (dto.status) updateData.status = dto.status;
      if (dto.plannedStartDate !== undefined) updateData.plannedStartDate = dto.plannedStartDate ? new Date(dto.plannedStartDate) : null;
      if (dto.plannedEndDate !== undefined) updateData.plannedEndDate = dto.plannedEndDate ? new Date(dto.plannedEndDate) : null;
      if (dto.startOdometer !== undefined) updateData.startOdometer = dto.startOdometer;
      if (dto.endOdometer !== undefined) updateData.endOdometer = dto.endOdometer;
      if (dto.remarks !== undefined) updateData.remarks = dto.remarks;

      await this.tripModel.update(updateData, {
        where: { id, organizationId },
      });

      return this.findOne(organizationId, id);
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException(
          `Trip with trip number '${formattedTripNo}' already exists in your organization`,
        );
      }
      throw error;
    }
  }

  async updateStatus(organizationId: string, id: string, dto: UpdateTripStatusDto) {
    const trip = await this.findOne(organizationId, id);

    const allowed = this.allowedTransitions[trip.status];
    if (!allowed || !allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition trip status from '${trip.status}' to '${dto.status}'. Allowed transitions: [${allowed?.join(', ') || ''}]`,
      );
    }

    const updateData: any = {
      status: dto.status,
    };
    if (dto.remarks) updateData.remarks = dto.remarks;

    if (dto.status === TripStatus.IN_TRANSIT && !trip.actualStartDate) {
      updateData.actualStartDate = new Date();
    }

    if ((dto.status === TripStatus.COMPLETED || dto.status === TripStatus.CANCELLED) && !trip.actualEndDate) {
      updateData.actualEndDate = new Date();
    }

    await this.tripModel.update(updateData, { where: { id, organizationId } });

    // Handle vehicle and driver status updates based on new trip status
    if (trip.vehicleId) {
      let vehicleStatus: string = VehicleStatus.AVAILABLE;
      if (dto.status === TripStatus.ASSIGNED) vehicleStatus = VehicleStatus.ASSIGNED;
      else if (dto.status === TripStatus.IN_TRANSIT || dto.status === TripStatus.DISPATCHED) vehicleStatus = VehicleStatus.IN_TRANSIT;
      else if (dto.status === TripStatus.COMPLETED || dto.status === TripStatus.CANCELLED) vehicleStatus = VehicleStatus.AVAILABLE;

      await this.vehicleModel.update(
        { status: vehicleStatus },
        { where: { id: trip.vehicleId } }
      );
    }

    if (trip.driverId) {
      let driverStatus: string = DriverStatus.AVAILABLE;
      if (dto.status === TripStatus.ASSIGNED) driverStatus = DriverStatus.ASSIGNED;
      else if (dto.status === TripStatus.IN_TRANSIT || dto.status === TripStatus.DISPATCHED) driverStatus = DriverStatus.ON_TRIP;
      else if (dto.status === TripStatus.COMPLETED || dto.status === TripStatus.CANCELLED) driverStatus = DriverStatus.AVAILABLE;

      await this.driverModel.update(
        { status: driverStatus },
        { where: { id: trip.driverId } }
      );
    }

    return this.findOne(organizationId, id);
  }

  async addStop(organizationId: string, tripId: string, dto: CreateTripStopDto) {
    const trip = await this.findOne(organizationId, tripId);

    if (dto.shipmentId) {
      const shipment = await this.shipmentModel.findOne({
        where: { id: dto.shipmentId, organizationId },
      });
      if (!shipment) {
        throw new BadRequestException(`Shipment with ID '${dto.shipmentId}' not found in your organization`);
      }
    }

    let maxSeq = 0;
    if (trip.stops && trip.stops.length > 0) {
      maxSeq = Math.max(...trip.stops.map((s: any) => s.sequence));
    }

    await this.tripStopModel.create({
      tripId,
      sequence: dto.sequence || maxSeq + 1,
      shipmentId: dto.shipmentId,
      stopType: dto.stopType,
      locationName: dto.locationName,
      city: dto.city,
      pincode: dto.pincode,
      status: dto.status,
      remarks: dto.remarks,
    } as any);

    return this.findOne(organizationId, tripId);
  }

  async updateStopStatus(organizationId: string, tripId: string, stopId: string, dto: UpdateTripStopStatusDto) {
    await this.findOne(organizationId, tripId);

    const stop = await this.tripStopModel.findOne({
      where: { id: stopId, tripId },
    });

    if (!stop) {
      throw new NotFoundException(`Trip stop with ID '${stopId}' not found on this trip`);
    }

    const updateData: any = { status: dto.status };
    if (dto.arrivalTime) updateData.arrivalTime = new Date(dto.arrivalTime);
    if (dto.departureTime) updateData.departureTime = new Date(dto.departureTime);
    if (dto.remarks !== undefined) updateData.remarks = dto.remarks;

    await this.tripStopModel.update(updateData, { where: { id: stopId } });

    return this.tripStopModel.findOne({
      where: { id: stopId },
      include: [{ model: Shipment, as: 'shipment' }],
    });
  }

  async removeStop(organizationId: string, tripId: string, stopId: string) {
    await this.findOne(organizationId, tripId);

    const stop = await this.tripStopModel.findOne({
      where: { id: stopId, tripId },
    });

    if (!stop) {
      throw new NotFoundException(`Trip stop with ID '${stopId}' not found on this trip`);
    }

    await stop.destroy();

    return { message: 'Trip stop removed successfully' };
  }

  async remove(organizationId: string, id: string) {
    const trip = await this.findOne(organizationId, id);

    await trip.destroy();

    return { message: 'Trip deleted successfully' };
  }
}
