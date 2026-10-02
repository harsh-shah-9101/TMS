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
exports.DispatchService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const dispatch_model_1 = require("./models/dispatch.model");
const trip_model_1 = require("../trips/models/trip.model");
const vehicle_model_1 = require("../vehicles/models/vehicle.model");
const driver_model_1 = require("../drivers/models/driver.model");
const route_model_1 = require("../routes/models/route.model");
const trip_stop_model_1 = require("../trips/models/trip-stop.model");
const enums_1 = require("../../common/enums");
let DispatchService = class DispatchService {
    dispatchModel;
    tripModel;
    vehicleModel;
    driverModel;
    constructor(dispatchModel, tripModel, vehicleModel, driverModel) {
        this.dispatchModel = dispatchModel;
        this.tripModel = tripModel;
        this.vehicleModel = vehicleModel;
        this.driverModel = driverModel;
    }
    async create(organizationId, userId, dto) {
        const formattedDispatchNo = dto.dispatchNumber.replace(/\s+/g, '').toUpperCase();
        try {
            const trip = await this.tripModel.findOne({
                where: { id: dto.tripId, organizationId },
                include: [
                    { model: vehicle_model_1.Vehicle, as: 'vehicle' },
                    { model: driver_model_1.Driver, as: 'driver' },
                ],
            });
            if (!trip) {
                throw new common_1.NotFoundException(`Trip with ID '${dto.tripId}' not found in your organization`);
            }
            const dispatch = await this.dispatchModel.create({
                organizationId,
                tripId: dto.tripId,
                dispatchNumber: formattedDispatchNo,
                gatePassNumber: dto.gatePassNumber,
                status: dto.status || enums_1.DispatchStatus.DISPATCHED,
                dispatchedByUserId: userId,
                remarks: dto.remarks,
            });
            await this.tripModel.update({
                status: enums_1.TripStatus.DISPATCHED,
                actualStartDate: trip.actualStartDate || new Date(),
            }, { where: { id: dto.tripId } });
            if (trip.vehicleId) {
                await this.vehicleModel.update({ status: enums_1.VehicleStatus.IN_TRANSIT }, { where: { id: trip.vehicleId } });
            }
            if (trip.driverId) {
                await this.driverModel.update({ status: enums_1.DriverStatus.ON_TRIP }, { where: { id: trip.driverId } });
            }
            return this.findOne(organizationId, dispatch.id);
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new common_1.ConflictException(`Dispatch record with number '${formattedDispatchNo}' already exists in your organization`);
            }
            throw error;
        }
    }
    async findAll(organizationId, query) {
        const { search, status, tripId, page = 1, limit = 10 } = query;
        const offset = (page - 1) * limit;
        const where = { organizationId };
        if (status)
            where.status = status;
        if (tripId)
            where.tripId = tripId;
        if (search) {
            where[sequelize_2.Op.or] = [
                { dispatchNumber: { [sequelize_2.Op.iLike]: `%${search}%` } },
                { gatePassNumber: { [sequelize_2.Op.iLike]: `%${search}%` } },
                { remarks: { [sequelize_2.Op.iLike]: `%${search}%` } },
            ];
        }
        const { rows: data, count: total } = await this.dispatchModel.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: trip_model_1.Trip,
                    as: 'trip',
                    include: [
                        { model: vehicle_model_1.Vehicle, as: 'vehicle' },
                        { model: driver_model_1.Driver, as: 'driver' },
                        { model: route_model_1.Route, as: 'route' },
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
    async findOne(organizationId, id) {
        const dispatch = await this.dispatchModel.findOne({
            where: { id, organizationId },
            include: [
                {
                    model: trip_model_1.Trip,
                    as: 'trip',
                    include: [
                        { model: vehicle_model_1.Vehicle, as: 'vehicle' },
                        { model: driver_model_1.Driver, as: 'driver' },
                        { model: route_model_1.Route, as: 'route' },
                        { model: trip_stop_model_1.TripStop, as: 'stops' },
                    ],
                },
            ],
            order: [
                [{ model: trip_model_1.Trip, as: 'trip' }, { model: trip_stop_model_1.TripStop, as: 'stops' }, 'sequence', 'ASC'],
            ],
        });
        if (!dispatch) {
            throw new common_1.NotFoundException(`Dispatch record with ID '${id}' not found`);
        }
        return dispatch;
    }
    async updateStatus(organizationId, id, dto) {
        const dispatch = await this.findOne(organizationId, id);
        const updateData = { status: dto.status };
        if (dto.remarks)
            updateData.remarks = dto.remarks;
        await this.dispatchModel.update(updateData, { where: { id } });
        if (dto.status === enums_1.DispatchStatus.CANCELLED) {
            await this.tripModel.update({ status: enums_1.TripStatus.PLANNED }, { where: { id: dispatch.tripId } });
        }
        else if (dto.status === enums_1.DispatchStatus.GATE_OUT) {
            await this.tripModel.update({ status: enums_1.TripStatus.IN_TRANSIT }, { where: { id: dispatch.tripId } });
        }
        return this.findOne(organizationId, id);
    }
};
exports.DispatchService = DispatchService;
exports.DispatchService = DispatchService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(dispatch_model_1.Dispatch)),
    __param(1, (0, sequelize_1.InjectModel)(trip_model_1.Trip)),
    __param(2, (0, sequelize_1.InjectModel)(vehicle_model_1.Vehicle)),
    __param(3, (0, sequelize_1.InjectModel)(driver_model_1.Driver)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], DispatchService);
//# sourceMappingURL=dispatch.service.js.map