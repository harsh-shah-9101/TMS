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
exports.ShipmentsService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const shipment_model_1 = require("./models/shipment.model");
const shipment_item_model_1 = require("./models/shipment-item.model");
const customer_model_1 = require("../customers/models/customer.model");
const client_1 = require("@prisma/client");
let ShipmentsService = class ShipmentsService {
    shipmentModel;
    customerModel;
    constructor(shipmentModel, customerModel) {
        this.shipmentModel = shipmentModel;
        this.customerModel = customerModel;
    }
    allowedTransitions = {
        [client_1.ShipmentStatus.DRAFT]: [client_1.ShipmentStatus.CREATED, client_1.ShipmentStatus.CANCELLED],
        [client_1.ShipmentStatus.CREATED]: [client_1.ShipmentStatus.VALIDATED, client_1.ShipmentStatus.PLANNED, client_1.ShipmentStatus.CANCELLED],
        [client_1.ShipmentStatus.VALIDATED]: [client_1.ShipmentStatus.PLANNED, client_1.ShipmentStatus.CANCELLED],
        [client_1.ShipmentStatus.PLANNED]: [client_1.ShipmentStatus.ASSIGNED, client_1.ShipmentStatus.CANCELLED],
        [client_1.ShipmentStatus.ASSIGNED]: [client_1.ShipmentStatus.IN_TRANSIT, client_1.ShipmentStatus.CANCELLED],
        [client_1.ShipmentStatus.IN_TRANSIT]: [client_1.ShipmentStatus.DELIVERED, client_1.ShipmentStatus.CANCELLED],
        [client_1.ShipmentStatus.DELIVERED]: [],
        [client_1.ShipmentStatus.CANCELLED]: [],
    };
    async create(organizationId, dto) {
        const formattedBookingNo = dto.bookingNumber.replace(/\s+/g, '').toUpperCase();
        const customer = await this.customerModel.findOne({
            where: { id: dto.customerId, organizationId },
        });
        if (!customer) {
            throw new common_1.BadRequestException(`Customer with ID '${dto.customerId}' not found in your organization`);
        }
        if (dto.consigneeId) {
            const consignee = await this.customerModel.findOne({
                where: { id: dto.consigneeId, organizationId },
            });
            if (!consignee) {
                throw new common_1.BadRequestException(`Consignee with ID '${dto.consigneeId}' not found in your organization`);
            }
        }
        let totalWeightKg = 0;
        let totalVolumeCuFt = 0;
        if (dto.items && dto.items.length > 0) {
            for (const item of dto.items) {
                totalWeightKg += (item.weightKg || 0) * (item.quantity || 1);
                totalVolumeCuFt += (item.volumeCuFt || 0) * (item.quantity || 1);
            }
        }
        const itemsToCreate = dto.items ? dto.items.map((i) => ({
            description: i.description,
            quantity: i.quantity || 1,
            weightKg: i.weightKg || 0,
            volumeCuFt: i.volumeCuFt || 0,
            declaredValue: i.declaredValue,
        })) : undefined;
        try {
            const shipment = await this.shipmentModel.create({
                organizationId,
                bookingNumber: formattedBookingNo,
                customerId: dto.customerId,
                consigneeId: dto.consigneeId,
                originCity: dto.originCity,
                originPincode: dto.originPincode,
                destinationCity: dto.destinationCity,
                destinationPincode: dto.destinationPincode,
                pickupDate: dto.pickupDate ? new Date(dto.pickupDate) : null,
                expectedDeliveryDate: dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : null,
                status: dto.status || client_1.ShipmentStatus.CREATED,
                totalWeightKg,
                totalVolumeCuFt,
                freightAmount: dto.freightAmount || 0,
                items: itemsToCreate,
            }, {
                include: [{ model: shipment_item_model_1.ShipmentItem, as: 'items' }],
            });
            return this.findOne(organizationId, shipment.id);
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new common_1.ConflictException(`Shipment with booking number '${formattedBookingNo}' already exists in your organization`);
            }
            throw error;
        }
    }
    async findAll(organizationId, query) {
        const { search, status, customerId, page = 1, limit = 10 } = query;
        const offset = (page - 1) * limit;
        const where = { organizationId };
        if (status)
            where.status = status;
        if (customerId)
            where.customerId = customerId;
        if (search) {
            where[sequelize_2.Op.or] = [
                { bookingNumber: { [sequelize_2.Op.iLike]: `%${search}%` } },
                { originCity: { [sequelize_2.Op.iLike]: `%${search}%` } },
                { destinationCity: { [sequelize_2.Op.iLike]: `%${search}%` } },
            ];
        }
        const { rows: data, count: total } = await this.shipmentModel.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            include: [
                { model: customer_model_1.Customer, as: 'customer' },
                { model: customer_model_1.Customer, as: 'consignee' },
                { model: shipment_item_model_1.ShipmentItem, as: 'items' },
            ],
            distinct: true,
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
        const shipment = await this.shipmentModel.findOne({
            where: { id, organizationId },
            include: [
                { model: customer_model_1.Customer, as: 'customer' },
                { model: customer_model_1.Customer, as: 'consignee' },
                { model: shipment_item_model_1.ShipmentItem, as: 'items' },
            ],
        });
        if (!shipment) {
            throw new common_1.NotFoundException(`Shipment with ID '${id}' not found`);
        }
        return shipment;
    }
    async updateStatus(organizationId, id, dto) {
        const shipment = await this.findOne(organizationId, id);
        const currentStatus = shipment.status;
        const newStatus = dto.status;
        if (currentStatus === newStatus) {
            return shipment;
        }
        const allowed = this.allowedTransitions[currentStatus];
        if (!allowed || !allowed.includes(newStatus)) {
            throw new common_1.BadRequestException(`Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed transitions: [${allowed.join(', ')}]`);
        }
        await this.shipmentModel.update({ status: newStatus }, { where: { id, organizationId } });
        return this.findOne(organizationId, id);
    }
    async update(organizationId, id, dto) {
        await this.findOne(organizationId, id);
        let formattedBookingNo;
        if (dto.bookingNumber) {
            formattedBookingNo = dto.bookingNumber.replace(/\s+/g, '').toUpperCase();
        }
        try {
            const data = {};
            if (formattedBookingNo)
                data.bookingNumber = formattedBookingNo;
            if (dto.customerId)
                data.customerId = dto.customerId;
            if (dto.consigneeId !== undefined)
                data.consigneeId = dto.consigneeId;
            if (dto.originCity)
                data.originCity = dto.originCity;
            if (dto.originPincode !== undefined)
                data.originPincode = dto.originPincode;
            if (dto.destinationCity)
                data.destinationCity = dto.destinationCity;
            if (dto.destinationPincode !== undefined)
                data.destinationPincode = dto.destinationPincode;
            if (dto.pickupDate !== undefined) {
                data.pickupDate = dto.pickupDate ? new Date(dto.pickupDate) : null;
            }
            if (dto.expectedDeliveryDate !== undefined) {
                data.expectedDeliveryDate = dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : null;
            }
            if (dto.freightAmount !== undefined)
                data.freightAmount = dto.freightAmount;
            await this.shipmentModel.update(data, {
                where: { id, organizationId },
            });
            return this.findOne(organizationId, id);
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new common_1.ConflictException(`Shipment with booking number '${formattedBookingNo}' already exists in your organization`);
            }
            throw error;
        }
    }
    async remove(organizationId, id) {
        const shipment = await this.findOne(organizationId, id);
        await shipment.destroy();
        return { message: 'Shipment deleted successfully' };
    }
};
exports.ShipmentsService = ShipmentsService;
exports.ShipmentsService = ShipmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(shipment_model_1.Shipment)),
    __param(1, (0, sequelize_1.InjectModel)(customer_model_1.Customer)),
    __metadata("design:paramtypes", [Object, Object])
], ShipmentsService);
//# sourceMappingURL=shipments.service.js.map