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
exports.DriversService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const driver_model_1 = require("./models/driver.model");
const user_model_1 = require("../users/models/user.model");
let DriversService = class DriversService {
    driverModel;
    userModel;
    constructor(driverModel, userModel) {
        this.driverModel = driverModel;
        this.userModel = userModel;
    }
    async create(organizationId, dto) {
        const formattedLicense = dto.licenseNumber.replace(/\s+/g, '').toUpperCase();
        const existing = await this.driverModel.findOne({
            where: {
                organizationId,
                licenseNumber: formattedLicense,
            },
        });
        if (existing) {
            throw new common_1.ConflictException(`Driver with license number '${formattedLicense}' already exists in your organization`);
        }
        if (dto.userId) {
            const user = await this.userModel.findOne({
                where: {
                    id: dto.userId,
                    organizationId,
                },
            });
            if (!user) {
                throw new common_1.BadRequestException(`User with ID '${dto.userId}' not found in your organization`);
            }
        }
        return this.driverModel.create({
            organizationId,
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
            licenseNumber: formattedLicense,
            licenseCategory: dto.licenseCategory,
            licenseExpiry: dto.licenseExpiry ? new Date(dto.licenseExpiry) : null,
            userId: dto.userId,
            status: dto.status,
        });
    }
    async findAll(organizationId, query) {
        const { search, status, page = 1, limit = 10 } = query;
        const offset = (page - 1) * limit;
        const where = { organizationId };
        if (status)
            where.status = status;
        if (search) {
            where[sequelize_2.Op.or] = [
                { firstName: { [sequelize_2.Op.iLike]: `%${search}%` } },
                { lastName: { [sequelize_2.Op.iLike]: `%${search}%` } },
                { phone: { [sequelize_2.Op.iLike]: `%${search}%` } },
                { licenseNumber: { [sequelize_2.Op.iLike]: `%${search}%` } },
            ];
        }
        const { rows: data, count: total } = await this.driverModel.findAndCountAll({
            where,
            offset,
            limit,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: user_model_1.User,
                    as: 'user',
                    attributes: ['id', 'email', 'status'],
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
        const driver = await this.driverModel.findOne({
            where: {
                id,
                organizationId,
            },
            include: [
                {
                    model: user_model_1.User,
                    as: 'user',
                    attributes: ['id', 'email', 'status'],
                },
            ],
        });
        if (!driver) {
            throw new common_1.NotFoundException(`Driver with ID '${id}' not found`);
        }
        return driver;
    }
    async update(organizationId, id, dto) {
        const driver = await this.findOne(organizationId, id);
        let formattedLicense;
        if (dto.licenseNumber) {
            formattedLicense = dto.licenseNumber.replace(/\s+/g, '').toUpperCase();
            const duplicate = await this.driverModel.findOne({
                where: {
                    organizationId,
                    licenseNumber: formattedLicense,
                    id: { [sequelize_2.Op.ne]: id },
                },
            });
            if (duplicate) {
                throw new common_1.ConflictException(`Driver with license number '${formattedLicense}' already exists in your organization`);
            }
        }
        if (dto.userId) {
            const user = await this.userModel.findOne({
                where: {
                    id: dto.userId,
                    organizationId,
                },
            });
            if (!user) {
                throw new common_1.BadRequestException(`User with ID '${dto.userId}' not found in your organization`);
            }
        }
        await driver.update({
            ...(dto.firstName && { firstName: dto.firstName }),
            ...(dto.lastName && { lastName: dto.lastName }),
            ...(dto.phone && { phone: dto.phone }),
            ...(formattedLicense && { licenseNumber: formattedLicense }),
            ...(dto.licenseCategory !== undefined && { licenseCategory: dto.licenseCategory }),
            ...(dto.licenseExpiry !== undefined && {
                licenseExpiry: dto.licenseExpiry ? new Date(dto.licenseExpiry) : null,
            }),
            ...(dto.userId !== undefined && { userId: dto.userId }),
            ...(dto.status && { status: dto.status }),
        });
        return this.findOne(organizationId, id);
    }
    async remove(organizationId, id) {
        const driver = await this.findOne(organizationId, id);
        await driver.destroy();
        return { message: 'Driver deleted successfully' };
    }
};
exports.DriversService = DriversService;
exports.DriversService = DriversService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(driver_model_1.Driver)),
    __param(1, (0, sequelize_1.InjectModel)(user_model_1.User)),
    __metadata("design:paramtypes", [Object, Object])
], DriversService);
//# sourceMappingURL=drivers.service.js.map