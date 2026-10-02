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
exports.CarriersService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const carrier_model_1 = require("./models/carrier.model");
let CarriersService = class CarriersService {
    carrierModel;
    constructor(carrierModel) {
        this.carrierModel = carrierModel;
    }
    async create(organizationId, dto) {
        const formattedCode = dto.code.toUpperCase();
        try {
            const data = {
                organizationId,
                name: dto.name,
                code: formattedCode,
            };
            if (dto.gstin)
                data.gstin = dto.gstin.toUpperCase();
            if (dto.pan)
                data.pan = dto.pan.toUpperCase();
            if (dto.email)
                data.email = dto.email.toLowerCase();
            if (dto.phone)
                data.phone = dto.phone;
            if (dto.addressLine1)
                data.addressLine1 = dto.addressLine1;
            if (dto.city)
                data.city = dto.city;
            if (dto.state)
                data.state = dto.state;
            if (dto.pincode)
                data.pincode = dto.pincode;
            if (dto.rating !== undefined)
                data.rating = dto.rating;
            if (dto.status)
                data.status = dto.status;
            const carrier = await this.carrierModel.create(data);
            return carrier;
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new common_1.ConflictException(`Carrier with code '${formattedCode}' already exists in your organization`);
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
                { gstin: { [sequelize_2.Op.iLike]: `%${search}%` } },
                { city: { [sequelize_2.Op.iLike]: `%${search}%` } },
                { phone: { [sequelize_2.Op.iLike]: `%${search}%` } },
            ];
        }
        const { rows: data, count: total } = await this.carrierModel.findAndCountAll({
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
        const carrier = await this.carrierModel.findOne({
            where: { id, organizationId },
        });
        if (!carrier) {
            throw new common_1.NotFoundException(`Carrier with ID '${id}' not found`);
        }
        return carrier;
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
            if (dto.gstin !== undefined)
                data.gstin = dto.gstin ? dto.gstin.toUpperCase() : null;
            if (dto.pan !== undefined)
                data.pan = dto.pan ? dto.pan.toUpperCase() : null;
            if (dto.email !== undefined)
                data.email = dto.email ? dto.email.toLowerCase() : null;
            if (dto.phone !== undefined)
                data.phone = dto.phone;
            if (dto.addressLine1 !== undefined)
                data.addressLine1 = dto.addressLine1;
            if (dto.city !== undefined)
                data.city = dto.city;
            if (dto.state !== undefined)
                data.state = dto.state;
            if (dto.pincode !== undefined)
                data.pincode = dto.pincode;
            if (dto.rating !== undefined)
                data.rating = dto.rating;
            if (dto.status)
                data.status = dto.status;
            const [affectedCount, affectedRows] = await this.carrierModel.update(data, {
                where: { id, organizationId },
                returning: true,
            });
            return affectedRows[0];
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new common_1.ConflictException(`Carrier with code '${formattedCode}' already exists in your organization`);
            }
            throw error;
        }
    }
    async remove(organizationId, id) {
        const carrier = await this.findOne(organizationId, id);
        await carrier.destroy();
        return { message: 'Carrier deleted successfully' };
    }
};
exports.CarriersService = CarriersService;
exports.CarriersService = CarriersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(carrier_model_1.Carrier)),
    __metadata("design:paramtypes", [Object])
], CarriersService);
//# sourceMappingURL=carriers.service.js.map