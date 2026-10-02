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
exports.PurchaseBillsService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const purchase_bills_model_1 = require("./models/purchase-bills.model");
let PurchaseBillsService = class PurchaseBillsService {
    model;
    constructor(model) {
        this.model = model;
    }
    async create(organizationId, dto) {
        return this.model.create({ organizationId, ...dto });
    }
    async findAll(organizationId, query) {
        const limit = parseInt(query.limit || '10', 10);
        const offset = (parseInt(query.page || '1', 10) - 1) * limit;
        const where = { organizationId };
        const { rows: data, count: total } = await this.model.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']],
        });
        return {
            data,
            meta: {
                total,
                page: parseInt(query.page || '1', 10),
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(organizationId, id) {
        const record = await this.model.findOne({ where: { id, organizationId } });
        if (!record)
            throw new common_1.NotFoundException('Record not found');
        return record;
    }
};
exports.PurchaseBillsService = PurchaseBillsService;
exports.PurchaseBillsService = PurchaseBillsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(purchase_bills_model_1.PurchaseBill)),
    __metadata("design:paramtypes", [Object])
], PurchaseBillsService);
//# sourceMappingURL=purchase-bills.service.js.map