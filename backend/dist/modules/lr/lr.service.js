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
exports.LrService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const lr_model_1 = require("./models/lr.model");
const shipment_model_1 = require("../shipments/models/shipment.model");
let LrService = class LrService {
    lrModel;
    shipmentModel;
    constructor(lrModel, shipmentModel) {
        this.lrModel = lrModel;
        this.shipmentModel = shipmentModel;
    }
    async create(organizationId, dto) {
        const formattedLrNo = dto.lrNumber.replace(/\s+/g, '').toUpperCase();
        const shipment = await this.shipmentModel.findOne({
            where: {
                id: dto.shipmentId,
                organizationId,
            },
        });
        if (!shipment) {
            throw new common_1.BadRequestException(`Shipment with ID '${dto.shipmentId}' not found in your organization`);
        }
        const basicFreight = dto.basicFreight || 0;
        const otherCharges = dto.otherCharges || 0;
        const taxAmount = dto.taxAmount || 0;
        const totalAmount = basicFreight + otherCharges + taxAmount;
        try {
            const lr = await this.lrModel.create({
                organizationId,
                shipmentId: dto.shipmentId,
                lrNumber: formattedLrNo,
                consignorName: dto.consignorName,
                consignorAddress: dto.consignorAddress,
                consigneeName: dto.consigneeName,
                consigneeAddress: dto.consigneeAddress,
                freightTerms: dto.freightTerms,
                basicFreight,
                otherCharges,
                taxAmount,
                totalAmount,
                remarks: dto.remarks,
                status: dto.status,
            });
            return this.findOne(organizationId, lr.id);
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new common_1.ConflictException(`Lorry Receipt with number '${formattedLrNo}' already exists in your organization`);
            }
            throw error;
        }
    }
    async findAll(organizationId, query) {
        const { search, status, freightTerms, shipmentId, page = 1, limit = 10 } = query;
        const offset = (page - 1) * limit;
        const where = { organizationId };
        if (status)
            where.status = status;
        if (freightTerms)
            where.freightTerms = freightTerms;
        if (shipmentId)
            where.shipmentId = shipmentId;
        if (search) {
            where[sequelize_2.Op.or] = [
                { lrNumber: { [sequelize_2.Op.iLike]: `%${search}%` } },
                { consignorName: { [sequelize_2.Op.iLike]: `%${search}%` } },
                { consigneeName: { [sequelize_2.Op.iLike]: `%${search}%` } },
            ];
        }
        const { rows: data, count: total } = await this.lrModel.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            include: [
                { model: shipment_model_1.Shipment, as: 'shipment' },
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
        const lr = await this.lrModel.findOne({
            where: { id, organizationId },
            include: [
                { model: shipment_model_1.Shipment, as: 'shipment' },
            ],
        });
        if (!lr) {
            throw new common_1.NotFoundException(`Lorry Receipt with ID '${id}' not found`);
        }
        return lr;
    }
    async update(organizationId, id, dto) {
        const current = await this.findOne(organizationId, id);
        let formattedLrNo;
        if (dto.lrNumber) {
            formattedLrNo = dto.lrNumber.replace(/\s+/g, '').toUpperCase();
        }
        if (dto.shipmentId) {
            const shipment = await this.shipmentModel.findOne({
                where: { id: dto.shipmentId, organizationId },
            });
            if (!shipment) {
                throw new common_1.BadRequestException(`Shipment with ID '${dto.shipmentId}' not found in your organization`);
            }
        }
        const basicFreight = dto.basicFreight !== undefined ? dto.basicFreight : current.basicFreight;
        const otherCharges = dto.otherCharges !== undefined ? dto.otherCharges : current.otherCharges;
        const taxAmount = dto.taxAmount !== undefined ? dto.taxAmount : current.taxAmount;
        const totalAmount = basicFreight + otherCharges + taxAmount;
        try {
            const data = {};
            if (formattedLrNo)
                data.lrNumber = formattedLrNo;
            if (dto.shipmentId)
                data.shipmentId = dto.shipmentId;
            if (dto.consignorName)
                data.consignorName = dto.consignorName;
            if (dto.consignorAddress !== undefined)
                data.consignorAddress = dto.consignorAddress;
            if (dto.consigneeName)
                data.consigneeName = dto.consigneeName;
            if (dto.consigneeAddress !== undefined)
                data.consigneeAddress = dto.consigneeAddress;
            if (dto.freightTerms)
                data.freightTerms = dto.freightTerms;
            if (dto.basicFreight !== undefined)
                data.basicFreight = dto.basicFreight;
            if (dto.otherCharges !== undefined)
                data.otherCharges = dto.otherCharges;
            if (dto.taxAmount !== undefined)
                data.taxAmount = dto.taxAmount;
            data.totalAmount = totalAmount;
            if (dto.remarks !== undefined)
                data.remarks = dto.remarks;
            if (dto.status)
                data.status = dto.status;
            await this.lrModel.update(data, {
                where: { id, organizationId },
            });
            return this.findOne(organizationId, id);
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new common_1.ConflictException(`Lorry Receipt with number '${formattedLrNo}' already exists in your organization`);
            }
            throw error;
        }
    }
    async remove(organizationId, id) {
        const lr = await this.findOne(organizationId, id);
        await lr.destroy();
        return { message: 'Lorry Receipt deleted successfully' };
    }
};
exports.LrService = LrService;
exports.LrService = LrService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(lr_model_1.LorryReceipt)),
    __param(1, (0, sequelize_1.InjectModel)(shipment_model_1.Shipment)),
    __metadata("design:paramtypes", [Object, Object])
], LrService);
//# sourceMappingURL=lr.service.js.map