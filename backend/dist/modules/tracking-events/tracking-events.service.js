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
exports.TrackingEventsService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const tracking_event_model_1 = require("./models/tracking-event.model");
const trip_model_1 = require("../trips/models/trip.model");
const vehicle_model_1 = require("../vehicles/models/vehicle.model");
let TrackingEventsService = class TrackingEventsService {
    eventModel;
    tripModel;
    vehicleModel;
    constructor(eventModel, tripModel, vehicleModel) {
        this.eventModel = eventModel;
        this.tripModel = tripModel;
        this.vehicleModel = vehicleModel;
    }
    async create(organizationId, dto) {
        if (!dto.tripId && !dto.vehicleId) {
            throw new common_1.BadRequestException('At least one of tripId or vehicleId must be provided');
        }
        if (dto.tripId) {
            const trip = await this.tripModel.findOne({ where: { id: dto.tripId, organizationId } });
            if (!trip) {
                throw new common_1.BadRequestException(`Trip with ID '${dto.tripId}' not found in your organization`);
            }
        }
        if (dto.vehicleId) {
            const vehicle = await this.vehicleModel.findOne({ where: { id: dto.vehicleId, organizationId } });
            if (!vehicle) {
                throw new common_1.BadRequestException(`Vehicle with ID '${dto.vehicleId}' not found in your organization`);
            }
        }
        return this.eventModel.create({
            organizationId,
            ...dto,
            eventTime: new Date(dto.eventTime),
            source: dto.source || 'SYSTEM',
        });
    }
    async findAll(organizationId, query) {
        const { tripId, vehicleId, eventType, startTime, endTime, page = '1', limit = '10' } = query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const offset = (pageNum - 1) * limitNum;
        const where = { organizationId };
        if (tripId)
            where.tripId = tripId;
        if (vehicleId)
            where.vehicleId = vehicleId;
        if (eventType)
            where.eventType = eventType;
        if (startTime || endTime) {
            where.eventTime = {};
            if (startTime)
                where.eventTime[sequelize_2.Op.gte] = new Date(startTime);
            if (endTime)
                where.eventTime[sequelize_2.Op.lte] = new Date(endTime);
        }
        const { rows: data, count: total } = await this.eventModel.findAndCountAll({
            where,
            limit: limitNum,
            offset,
            order: [['eventTime', 'DESC']],
            include: [
                { model: trip_model_1.Trip, as: 'trip' },
                { model: vehicle_model_1.Vehicle, as: 'vehicle' }
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
};
exports.TrackingEventsService = TrackingEventsService;
exports.TrackingEventsService = TrackingEventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(tracking_event_model_1.TrackingEvent)),
    __param(1, (0, sequelize_1.InjectModel)(trip_model_1.Trip)),
    __param(2, (0, sequelize_1.InjectModel)(vehicle_model_1.Vehicle)),
    __metadata("design:paramtypes", [Object, Object, Object])
], TrackingEventsService);
//# sourceMappingURL=tracking-events.service.js.map