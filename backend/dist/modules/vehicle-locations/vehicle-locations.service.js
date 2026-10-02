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
exports.VehicleLocationsService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const vehicle_location_model_1 = require("./models/vehicle-location.model");
const vehicle_model_1 = require("../vehicles/models/vehicle.model");
let VehicleLocationsService = class VehicleLocationsService {
    locationModel;
    vehicleModel;
    constructor(locationModel, vehicleModel) {
        this.locationModel = locationModel;
        this.vehicleModel = vehicleModel;
    }
    async create(organizationId, dto) {
        const vehicle = await this.vehicleModel.findOne({
            where: { id: dto.vehicleId, organizationId },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException(`Vehicle with ID '${dto.vehicleId}' not found in your organization`);
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
        });
    }
    async findAll(organizationId, query) {
        const { vehicleId, startTime, endTime, page = '1', limit = '10' } = query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const offset = (pageNum - 1) * limitNum;
        const where = { organizationId };
        if (vehicleId) {
            where.vehicleId = vehicleId;
        }
        if (startTime || endTime) {
            where.recordedAt = {};
            if (startTime)
                where.recordedAt[sequelize_2.Op.gte] = new Date(startTime);
            if (endTime)
                where.recordedAt[sequelize_2.Op.lte] = new Date(endTime);
        }
        const { rows: data, count: total } = await this.locationModel.findAndCountAll({
            where,
            limit: limitNum,
            offset,
            order: [['recordedAt', 'DESC']],
            include: [
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
    async getLatestLocation(organizationId, vehicleId) {
        const location = await this.locationModel.findOne({
            where: { organizationId, vehicleId },
            order: [['recordedAt', 'DESC']],
            include: [{ model: vehicle_model_1.Vehicle, as: 'vehicle' }]
        });
        if (!location) {
            throw new common_1.NotFoundException(`No location found for vehicle '${vehicleId}'`);
        }
        return location;
    }
};
exports.VehicleLocationsService = VehicleLocationsService;
exports.VehicleLocationsService = VehicleLocationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(vehicle_location_model_1.VehicleLocation)),
    __param(1, (0, sequelize_1.InjectModel)(vehicle_model_1.Vehicle)),
    __metadata("design:paramtypes", [Object, Object])
], VehicleLocationsService);
//# sourceMappingURL=vehicle-locations.service.js.map