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
exports.VehiclesService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const vehicle_model_1 = require("./models/vehicle.model");
const vehicle_types_model_1 = require("../vehicle-types/models/vehicle-types.model");
let VehiclesService = class VehiclesService {
    vehicleModel;
    vehicleTypeModel;
    constructor(vehicleModel, vehicleTypeModel) {
        this.vehicleModel = vehicleModel;
        this.vehicleTypeModel = vehicleTypeModel;
    }
    async create(organizationId, dto) {
        const formattedRegNo = dto.registrationNumber.replace(/\s+/g, '').toUpperCase();
        const vehicleType = await this.vehicleTypeModel.findOne({
            where: {
                id: dto.vehicleTypeId,
                organizationId,
            },
        });
        if (!vehicleType) {
            throw new common_1.BadRequestException(`Vehicle type with ID '${dto.vehicleTypeId}' does not exist in your organization`);
        }
        const existing = await this.vehicleModel.findOne({
            where: {
                organizationId,
                registrationNumber: formattedRegNo,
            },
        });
        if (existing) {
            throw new common_1.ConflictException(`Vehicle with registration number '${formattedRegNo}' already exists in your organization`);
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
        });
    }
    async findAll(organizationId, query) {
        const { search, status, ownershipType, vehicleTypeId, page = 1, limit = 10 } = query;
        const offset = (page - 1) * limit;
        const where = { organizationId };
        if (status)
            where.status = status;
        if (ownershipType)
            where.ownershipType = ownershipType;
        if (vehicleTypeId)
            where.vehicleTypeId = vehicleTypeId;
        if (search) {
            where[sequelize_2.Op.or] = [
                { registrationNumber: { [sequelize_2.Op.iLike]: `%${search}%` } },
                { make: { [sequelize_2.Op.iLike]: `%${search}%` } },
                { model: { [sequelize_2.Op.iLike]: `%${search}%` } },
            ];
        }
        const { rows: data, count: total } = await this.vehicleModel.findAndCountAll({
            where,
            offset,
            limit,
            order: [['createdAt', 'DESC']],
            include: [{ model: vehicle_types_model_1.VehicleType, as: 'vehicleType' }],
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
        const vehicle = await this.vehicleModel.findOne({
            where: {
                id,
                organizationId,
            },
            include: [{ model: vehicle_types_model_1.VehicleType, as: 'vehicleType' }],
        });
        if (!vehicle) {
            throw new common_1.NotFoundException(`Vehicle with ID '${id}' not found`);
        }
        return vehicle;
    }
    async update(organizationId, id, dto) {
        const vehicle = await this.findOne(organizationId, id);
        let formattedRegNo;
        if (dto.registrationNumber) {
            formattedRegNo = dto.registrationNumber.replace(/\s+/g, '').toUpperCase();
            const duplicate = await this.vehicleModel.findOne({
                where: {
                    organizationId,
                    registrationNumber: formattedRegNo,
                    id: { [sequelize_2.Op.ne]: id },
                },
            });
            if (duplicate) {
                throw new common_1.ConflictException(`Vehicle with registration number '${formattedRegNo}' already exists in your organization`);
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
                throw new common_1.BadRequestException(`Vehicle type with ID '${dto.vehicleTypeId}' does not exist in your organization`);
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
    async remove(organizationId, id) {
        const vehicle = await this.findOne(organizationId, id);
        await vehicle.destroy();
        return { message: 'Vehicle deleted successfully' };
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(vehicle_model_1.Vehicle)),
    __param(1, (0, sequelize_1.InjectModel)(vehicle_types_model_1.VehicleType)),
    __metadata("design:paramtypes", [Object, Object])
], VehiclesService);
//# sourceMappingURL=vehicles.service.js.map