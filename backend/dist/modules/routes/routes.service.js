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
exports.RoutesService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const route_model_1 = require("./models/route.model");
let RoutesService = class RoutesService {
    routeModel;
    constructor(routeModel) {
        this.routeModel = routeModel;
    }
    async create(organizationId, dto) {
        const formattedCode = dto.code.toUpperCase();
        try {
            const route = await this.routeModel.create({
                organizationId,
                name: dto.name,
                code: formattedCode,
                originCity: dto.originCity,
                originState: dto.originState,
                destinationCity: dto.destinationCity,
                destinationState: dto.destinationState,
                distanceKm: dto.distanceKm || 0,
                estimatedHours: dto.estimatedHours || 0,
                status: dto.status,
            });
            return route;
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new common_1.ConflictException(`Route with code '${formattedCode}' already exists in your organization`);
            }
            throw error;
        }
    }
    async findAll(organizationId, query) {
        const { search, status, page = 1, limit = 10 } = query;
        const offset = (page - 1) * limit;
        const where = { organizationId };
        if (status)
            where.status = status;
        if (search) {
            where[sequelize_2.Op.or] = [
                { name: { [sequelize_2.Op.iLike]: `%${search}%` } },
                { code: { [sequelize_2.Op.iLike]: `%${search}%` } },
                { originCity: { [sequelize_2.Op.iLike]: `%${search}%` } },
                { destinationCity: { [sequelize_2.Op.iLike]: `%${search}%` } },
            ];
        }
        const { rows: data, count: total } = await this.routeModel.findAndCountAll({
            where,
            limit,
            offset,
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
        const route = await this.routeModel.findOne({
            where: { id, organizationId },
        });
        if (!route) {
            throw new common_1.NotFoundException(`Route with ID '${id}' not found`);
        }
        return route;
    }
    async update(organizationId, id, dto) {
        await this.findOne(organizationId, id);
        let formattedCode;
        if (dto.code) {
            formattedCode = dto.code.toUpperCase();
        }
        try {
            const data = {};
            if (dto.name)
                data.name = dto.name;
            if (formattedCode)
                data.code = formattedCode;
            if (dto.originCity)
                data.originCity = dto.originCity;
            if (dto.originState !== undefined)
                data.originState = dto.originState;
            if (dto.destinationCity)
                data.destinationCity = dto.destinationCity;
            if (dto.destinationState !== undefined)
                data.destinationState = dto.destinationState;
            if (dto.distanceKm !== undefined)
                data.distanceKm = dto.distanceKm;
            if (dto.estimatedHours !== undefined)
                data.estimatedHours = dto.estimatedHours;
            if (dto.status)
                data.status = dto.status;
            await this.routeModel.update(data, {
                where: { id, organizationId },
            });
            return this.findOne(organizationId, id);
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new common_1.ConflictException(`Route with code '${formattedCode}' already exists in your organization`);
            }
            throw error;
        }
    }
    async remove(organizationId, id) {
        const route = await this.findOne(organizationId, id);
        await route.destroy();
        return { message: 'Route deleted successfully' };
    }
};
exports.RoutesService = RoutesService;
exports.RoutesService = RoutesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(route_model_1.Route)),
    __metadata("design:paramtypes", [Object])
], RoutesService);
//# sourceMappingURL=routes.service.js.map