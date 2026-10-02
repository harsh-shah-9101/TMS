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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LorryReceipt = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const shipment_model_1 = require("../../shipments/models/shipment.model");
let LorryReceipt = class LorryReceipt extends sequelize_typescript_1.Model {
};
exports.LorryReceipt = LorryReceipt;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        primaryKey: true,
    }),
    __metadata("design:type", String)
], LorryReceipt.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
        field: 'organization_id',
    }),
    __metadata("design:type", String)
], LorryReceipt.prototype, "organizationId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => shipment_model_1.Shipment),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
        field: 'shipment_id',
    }),
    __metadata("design:type", String)
], LorryReceipt.prototype, "shipmentId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        field: 'lr_number',
    }),
    __metadata("design:type", String)
], LorryReceipt.prototype, "lrNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        defaultValue: sequelize_typescript_1.DataType.NOW,
        field: 'lr_date',
    }),
    __metadata("design:type", Date)
], LorryReceipt.prototype, "lrDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        allowNull: false,
        field: 'consignor_name',
    }),
    __metadata("design:type", String)
], LorryReceipt.prototype, "consignorName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        field: 'consignor_address',
    }),
    __metadata("design:type", Object)
], LorryReceipt.prototype, "consignorAddress", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        allowNull: false,
        field: 'consignee_name',
    }),
    __metadata("design:type", String)
], LorryReceipt.prototype, "consigneeName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        field: 'consignee_address',
    }),
    __metadata("design:type", Object)
], LorryReceipt.prototype, "consigneeAddress", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('PAID', 'TO_PAY', 'TO_BE_BILLED'),
        defaultValue: 'TO_PAY',
        field: 'freight_terms',
    }),
    __metadata("design:type", String)
], LorryReceipt.prototype, "freightTerms", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.FLOAT,
        defaultValue: 0,
        field: 'basic_freight',
    }),
    __metadata("design:type", Number)
], LorryReceipt.prototype, "basicFreight", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.FLOAT,
        defaultValue: 0,
        field: 'other_charges',
    }),
    __metadata("design:type", Number)
], LorryReceipt.prototype, "otherCharges", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.FLOAT,
        defaultValue: 0,
        field: 'tax_amount',
    }),
    __metadata("design:type", Number)
], LorryReceipt.prototype, "taxAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.FLOAT,
        defaultValue: 0,
        field: 'total_amount',
    }),
    __metadata("design:type", Number)
], LorryReceipt.prototype, "totalAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
    }),
    __metadata("design:type", Object)
], LorryReceipt.prototype, "remarks", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('ISSUED', 'CANCELLED'),
        defaultValue: 'ISSUED',
    }),
    __metadata("design:type", String)
], LorryReceipt.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => shipment_model_1.Shipment),
    __metadata("design:type", shipment_model_1.Shipment)
], LorryReceipt.prototype, "shipment", void 0);
exports.LorryReceipt = LorryReceipt = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'lorry_receipts',
        timestamps: true,
        paranoid: true,
        underscored: true,
    })
], LorryReceipt);
//# sourceMappingURL=lr.model.js.map