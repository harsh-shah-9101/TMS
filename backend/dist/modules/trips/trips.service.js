"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripsService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const trip_model_1 = require("./models/trip.model");
const trip_stop_model_1 = require("./models/trip-stop.model");
const route_model_1 = require("../routes/models/route.model");
const vehicle_model_1 = require("../vehicles/models/vehicle.model");
const driver_model_1 = require("../drivers/models/driver.model");
const carrier_model_1 = require("../carriers/models/carrier.model");
const shipment_model_1 = require("../shipments/models/shipment.model");
const client_1 = require("@prisma/client");
let TripsService = class TripsService {
    tripModel;
    tripStopModel;
    routeModel;
    vehicleModel;
    driverModel;
    carrierModel;
    shipmentModel;
    constructor(tripModel, tripStopModel, routeModel, vehicleModel, driverModel, carrierModel, shipmentModel) {
        this.tripModel = tripModel;
        this.tripStopModel = tripStopModel;
        this.routeModel = routeModel;
        this.vehicleModel = vehicleModel;
        this.driverModel = driverModel;
        this.carrierModel = carrierModel;
        this.shipmentModel = shipmentModel;
    }
    allowedTransitions = {
        [client_1.TripStatus.PLANNED]: [client_1.TripStatus.ASSIGNED, client_1.TripStatus.CANCELLED],
        [client_1.TripStatus.ASSIGNED]: [client_1.TripStatus.DISPATCHED, client_1.TripStatus.IN_TRANSIT, client_1.TripStatus.CANCELLED],
        [client_1.TripStatus.DISPATCHED]: [client_1.TripStatus.IN_TRANSIT, client_1.TripStatus.PAUSED, client_1.TripStatus.CANCELLED],
        [client_1.TripStatus.IN_TRANSIT]: [client_1.TripStatus.PAUSED, client_1.TripStatus.COMPLETED, client_1.TripStatus.CANCELLED],
        [client_1.TripStatus.PAUSED]: [client_1.TripStatus.IN_TRANSIT, client_1.TripStatus.COMPLETED, client_1.TripStatus.CANCELLED],
        [client_1.TripStatus.COMPLETED]: [],
        [client_1.TripStatus.CANCELLED]: [],
    };
    async create(organizationId, dto) {
        const formattedTripNo = dto.tripNumber.replace(/\s+/g, '').toUpperCase();
        if (dto.routeId) {
            const route = await this.routeModel.findOne({
                where: { id: dto.routeId, organizationId },
            });
            if (!route) {
                throw new common_1.BadRequestException(`Route with ID '${dto.routeId}' not found in your organization`);
            }
        }
        if (dto.vehicleId) {
            const vehicle = await this.vehicleModel.findOne({
                where: { id: dto.vehicleId, organizationId },
            });
            if (!vehicle) {
                throw new common_1.BadRequestException(`Vehicle with ID '${dto.vehicleId}' not found in your organization`);
            }
        }
        if (dto.driverId) {
            const driver = await this.driverModel.findOne({
                where: { id: dto.driverId, organizationId },
            });
            if (!driver) {
                throw new common_1.BadRequestException(`Driver with ID '${dto.driverId}' not found in your organization`);
            }
        }
        if (dto.carrierId) {
            const carrier = await this.carrierModel.findOne({
                where: { id: dto.carrierId, organizationId },
            });
            if (!carrier) {
                throw new common_1.BadRequestException(`Carrier with ID '${dto.carrierId}' not found in your organization`);
            }
        }
        let stopsToCreate = [];
        if (dto.stops && dto.stops.length > 0) {
            for (let i = 0; i < dto.stops.length; i++) {
                const stop = dto.stops[i];
                if (stop.shipmentId) {
                    const shipment = await this.shipmentModel.findOne({
                        where: { id: stop.shipmentId, organizationId },
                    });
                    if (!shipment) {
                        throw new common_1.BadRequestException(`Shipment with ID '${stop.shipmentId}' not found in your organization`);
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
                status: dto.status || client_1.TripStatus.PLANNED,
                plannedStartDate: dto.plannedStartDate ? new Date(dto.plannedStartDate) : null,
                plannedEndDate: dto.plannedEndDate ? new Date(dto.plannedEndDate) : null,
                startOdometer: dto.startOdometer,
                endOdometer: dto.endOdometer,
                remarks: dto.remarks,
                stops: stopsToCreate,
            }, {
                include: [{ model: trip_stop_model_1.TripStop, as: 'stops' }],
            });
            if (dto.vehicleId) {
                await this.vehicleModel.update({ status: client_1.VehicleStatus.ASSIGNED }, { where: { id: dto.vehicleId } });
            }
            if (dto.driverId) {
                await this.driverModel.update({ status: client_1.DriverStatus.ASSIGNED }, { where: { id: dto.driverId } });
            }
            return this.findOne(organizationId, trip.id);
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new common_1.ConflictException(`Trip with trip number '${formattedTripNo}' already exists in your organization`);
            }
            throw error;
        }
    }
    async findAll(organizationId, query) {
        const { search, status, vehicleId, driverId, carrierId, routeId, page = 1, limit = 10 } = query;
        const offset = (page - 1) * limit;
        const where = { organizationId };
        if (status)
            where.status = status;
        if (vehicleId)
            where.vehicleId = vehicleId;
        if (driverId)
            where.driverId = driverId;
        if (carrierId)
            where.carrierId = carrierId;
        if (routeId)
            where.routeId = routeId;
        if (search) {
            where[sequelize_2.Op.or] = [
                { tripNumber: { [sequelize_2.Op.iLike]: `%${search}%` } },
                { remarks: { [sequelize_2.Op.iLike]: `%${search}%` } },
            ];
        }
        const { rows: data, count: total } = await this.tripModel.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            include: [
                { model: route_model_1.Route, as: 'route' },
                { model: vehicle_model_1.Vehicle, as: 'vehicle' },
                { model: driver_model_1.Driver, as: 'driver' },
                { model: carrier_model_1.Carrier, as: 'carrier' },
                {
                    model: trip_stop_model_1.TripStop,
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
    async findOne(organizationId, id) {
        const trip = await this.tripModel.findOne({
            where: { id, organizationId },
            include: [
                { model: route_model_1.Route, as: 'route' },
                { model: vehicle_model_1.Vehicle, as: 'vehicle' },
                { model: driver_model_1.Driver, as: 'driver' },
                { model: carrier_model_1.Carrier, as: 'carrier' },
                {
                    model: trip_stop_model_1.TripStop,
                    as: 'stops',
                    include: [{ model: shipment_model_1.Shipment, as: 'shipment' }],
                },
            ],
            order: [
                [{ model: trip_stop_model_1.TripStop, as: 'stops' }, 'sequence', 'ASC'],
            ],
        });
        if (!trip) {
            throw new common_1.NotFoundException(`Trip with ID '${id}' not found`);
        }
        return trip;
    }
    async update(organizationId, id, dto) {
        const existingTrip = await this.findOne(organizationId, id);
        let formattedTripNo;
        if (dto.tripNumber) {
            formattedTripNo = dto.tripNumber.replace(/\s+/g, '').toUpperCase();
        }
        if (dto.routeId) {
            const route = await this.routeModel.findOne({
                where: { id: dto.routeId, organizationId },
            });
            if (!route) {
                throw new common_1.BadRequestException(`Route with ID '${dto.routeId}' not found in your organization`);
            }
        }
        if (dto.vehicleId) {
            const vehicle = await this.vehicleModel.findOne({
                where: { id: dto.vehicleId, organizationId },
            });
            if (!vehicle) {
                throw new common_1.BadRequestException(`Vehicle with ID '${dto.vehicleId}' not found in your organization`);
            }
        }
        if (dto.driverId) {
            const driver = await this.driverModel.findOne({
                where: { id: dto.driverId, organizationId },
            });
            if (!driver) {
                throw new common_1.BadRequestException(`Driver with ID '${dto.driverId}' not found in your organization`);
            }
        }
        if (dto.carrierId) {
            const carrier = await this.carrierModel.findOne({
                where: { id: dto.carrierId, organizationId },
            });
            if (!carrier) {
                throw new common_1.BadRequestException(`Carrier with ID '${dto.carrierId}' not found in your organization`);
            }
        }
        try {
            const updateData = {};
            if (formattedTripNo)
                updateData.tripNumber = formattedTripNo;
            if (dto.routeId !== undefined)
                updateData.routeId = dto.routeId;
            if (dto.vehicleId !== undefined)
                updateData.vehicleId = dto.vehicleId;
            if (dto.driverId !== undefined)
                updateData.driverId = dto.driverId;
            if (dto.carrierId !== undefined)
                updateData.carrierId = dto.carrierId;
            if (dto.status)
                updateData.status = dto.status;
            if (dto.plannedStartDate !== undefined)
                updateData.plannedStartDate = dto.plannedStartDate ? new Date(dto.plannedStartDate) : null;
            if (dto.plannedEndDate !== undefined)
                updateData.plannedEndDate = dto.plannedEndDate ? new Date(dto.plannedEndDate) : null;
            if (dto.startOdometer !== undefined)
                updateData.startOdometer = dto.startOdometer;
            if (dto.endOdometer !== undefined)
                updateData.endOdometer = dto.endOdometer;
            if (dto.remarks !== undefined)
                updateData.remarks = dto.remarks;
            await this.tripModel.update(updateData, {
                where: { id, organizationId },
            });
            return this.findOne(organizationId, id);
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new common_1.ConflictException(`Trip with trip number '${formattedTripNo}' already exists in your organization`);
            }
            throw error;
        }
    }
    async updateStatus(organizationId, id, dto) {
        const trip = await this.findOne(organizationId, id);
        const allowed = this.allowedTransitions[trip.status];
        if (!allowed || !allowed.includes(dto.status)) {
            throw new common_1.BadRequestException(`Cannot transition trip status from '${trip.status}' to '${dto.status}'. Allowed transitions: [${allowed?.join(', ') || ''}]`);
        }
        const updateData = {
            status: dto.status,
        };
        if (dto.remarks)
            updateData.remarks = dto.remarks;
        if (dto.status === client_1.TripStatus.IN_TRANSIT && !trip.actualStartDate) {
            updateData.actualStartDate = new Date();
        }
        if ((dto.status === client_1.TripStatus.COMPLETED || dto.status === client_1.TripStatus.CANCELLED) && !trip.actualEndDate) {
            updateData.actualEndDate = new Date();
        }
        await this.tripModel.update(updateData, { where: { id, organizationId } });
        if (trip.vehicleId) {
            let vehicleStatus = client_1.VehicleStatus.AVAILABLE;
            if (dto.status === client_1.TripStatus.ASSIGNED)
                vehicleStatus = client_1.VehicleStatus.ASSIGNED;
            else if (dto.status === client_1.TripStatus.IN_TRANSIT || dto.status === client_1.TripStatus.DISPATCHED)
                vehicleStatus = client_1.VehicleStatus.IN_TRANSIT;
            else if (dto.status === client_1.TripStatus.COMPLETED || dto.status === client_1.TripStatus.CANCELLED)
                vehicleStatus = client_1.VehicleStatus.AVAILABLE;
            await this.vehicleModel.update({ status: vehicleStatus }, { where: { id: trip.vehicleId } });
        }
        if (trip.driverId) {
            let driverStatus = client_1.DriverStatus.AVAILABLE;
            if (dto.status === client_1.TripStatus.ASSIGNED)
                driverStatus = client_1.DriverStatus.ASSIGNED;
            else if (dto.status === client_1.TripStatus.IN_TRANSIT || dto.status === client_1.TripStatus.DISPATCHED)
                driverStatus = client_1.DriverStatus.ON_TRIP;
            else if (dto.status === client_1.TripStatus.COMPLETED || dto.status === client_1.TripStatus.CANCELLED)
                driverStatus = client_1.DriverStatus.AVAILABLE;
            await this.driverModel.update({ status: driverStatus }, { where: { id: trip.driverId } });
        }
        return this.findOne(organizationId, id);
    }
    async addStop(organizationId, tripId, dto) {
        const trip = await this.findOne(organizationId, tripId);
        if (dto.shipmentId) {
            const shipment = await this.shipmentModel.findOne({
                where: { id: dto.shipmentId, organizationId },
            });
            if (!shipment) {
                throw new common_1.BadRequestException(`Shipment with ID '${dto.shipmentId}' not found in your organization`);
            }
        }
        let maxSeq = 0;
        if (trip.stops && trip.stops.length > 0) {
            maxSeq = Math.max(...trip.stops.map((s) => s.sequence));
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
        });
        return this.findOne(organizationId, tripId);
    }
    async updateStopStatus(organizationId, tripId, stopId, dto) {
        await this.findOne(organizationId, tripId);
        const stop = await this.tripStopModel.findOne({
            where: { id: stopId, tripId },
        });
        if (!stop) {
            throw new common_1.NotFoundException(`Trip stop with ID '${stopId}' not found on this trip`);
        }
        const updateData = { status: dto.status };
        if (dto.arrivalTime)
            updateData.arrivalTime = new Date(dto.arrivalTime);
        if (dto.departureTime)
            updateData.departureTime = new Date(dto.departureTime);
        if (dto.remarks !== undefined)
            updateData.remarks = dto.remarks;
        await this.tripStopModel.update(updateData, { where: { id: stopId } });
        return this.tripStopModel.findOne({
            where: { id: stopId },
            include: [{ model: shipment_model_1.Shipment, as: 'shipment' }],
        });
    }
    async removeStop(organizationId, tripId, stopId) {
        await this.findOne(organizationId, tripId);
        const stop = await this.tripStopModel.findOne({
            where: { id: stopId, tripId },
        });
        if (!stop) {
            throw new common_1.NotFoundException(`Trip stop with ID '${stopId}' not found on this trip`);
        }
        await stop.destroy();
        return { message: 'Trip stop removed successfully' };
    }
    async remove(organizationId, id) {
        const trip = await this.findOne(organizationId, id);
        await trip.destroy();
        return { message: 'Trip deleted successfully' };
    }
};
exports.TripsService = TripsService;
exports.TripsService = TripsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(trip_model_1.Trip)),
    __param(1, (0, sequelize_1.InjectModel)(trip_stop_model_1.TripStop)),
    __param(2, (0, sequelize_1.InjectModel)(route_model_1.Route)),
    __param(3, (0, sequelize_1.InjectModel)(vehicle_model_1.Vehicle)),
    __param(4, (0, sequelize_1.InjectModel)(driver_model_1.Driver)),
    __param(5, (0, sequelize_1.InjectModel)(carrier_model_1.Carrier)),
    __param(6, (0, sequelize_1.InjectModel)(shipment_model_1.Shipment)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], TripsService);
//# sourceMappingURL=trips.service.js.map