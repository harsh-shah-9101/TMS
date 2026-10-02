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
exports.VehicleTypesService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const vehicle_types_model_1 = require("./models/vehicle-types.model");
let VehicleTypesService = class VehicleTypesService {
    vehicleTypeModel;
    constructor(vehicleTypeModel) {
        this.vehicleTypeModel = vehicleTypeModel;
    }
    async create(organizationId, dto) {
        const existing = await this.vehicleTypeModel.findOne({
            where: {
                organizationId,
                code: dto.code.toUpperCase(),
            },
        });
        if (existing) {
            throw new common_1.ConflictException(`Vehicle type with code '${dto.code.toUpperCase()}' already exists in your organization`);
        }
        return this.vehicleTypeModel.create({
            organizationId,
            name: dto.name,
            code: dto.code.toUpperCase(),
            capacityTons: dto.capacityTons,
            volumeCuFt: dto.volumeCuFt,
            axleCount: dto.axleCount,
            fuelType: dto.fuelType,
            status: dto.status,
        });
    }
    async findAll(organizationId, query) {
        const { search, status, fuelType, page = 1, limit = 10 } = query;
        const offset = (page - 1) * limit;
        const where = { organizationId };
        if (status)
            where.status = status;
        if (fuelType)
            where.fuelType = fuelType;
        if (search) {
            where[sequelize_2.Op.or] = [
                { name: { [sequelize_2.Op.iLike]: `%${search}%` } },
                { code: { [sequelize_2.Op.iLike]: `%${search}%` } },
            ];
        }
        const { rows: data, count: total } = await this.vehicleTypeModel.findAndCountAll({
            where,
            offset,
            limit,
            order: [['createdAt', 'DESC']],
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
        const vehicleType = await this.vehicleTypeModel.findOne({
            where: {
                id,
                organizationId,
            },
        });
        if (!vehicleType) {
            throw new common_1.NotFoundException(`Vehicle type with ID '${id}' not found`);
        }
        return vehicleType;
    }
    async update(organizationId, id, dto) {
        const vehicleType = await this.findOne(organizationId, id);
        if (dto.code) {
            const duplicateCode = await this.vehicleTypeModel.findOne({
                where: {
                    organizationId,
                    code: dto.code.toUpperCase(),
                    id: { [sequelize_2.Op.ne]: id },
                },
            });
            if (duplicateCode) {
                throw new common_1.ConflictException(`Vehicle type with code '${dto.code.toUpperCase()}' already exists in your organization`);
            }
        }
        await vehicleType.update({
            ...(dto.name && { name: dto.name }),
            ...(dto.code && { code: dto.code.toUpperCase() }),
            ...(dto.capacityTons !== undefined && { capacityTons: dto.capacityTons }),
            ...(dto.volumeCuFt !== undefined && { volumeCuFt: dto.volumeCuFt }),
            ...(dto.axleCount !== undefined && { axleCount: dto.axleCount }),
            ...(dto.fuelType && { fuelType: dto.fuelType }),
            ...(dto.status && { status: dto.status }),
        });
        return this.findOne(organizationId, id);
    }
    async remove(organizationId, id) {
        const vehicleType = await this.findOne(organizationId, id);
        await vehicleType.destroy();
        return { message: 'Vehicle type deleted successfully' };
    }
};
exports.VehicleTypesService = VehicleTypesService;
exports.VehicleTypesService = VehicleTypesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(vehicle_types_model_1.VehicleType)),
    __metadata("design:paramtypes", [Object])
], VehicleTypesService);
//# sourceMappingURL=vehicle-types.service.js.map