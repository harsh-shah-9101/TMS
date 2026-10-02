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
exports.Shipment = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const shipment_item_model_1 = require("./shipment-item.model");
const customer_model_1 = require("../../customers/models/customer.model");
let Shipment = class Shipment extends sequelize_typescript_1.Model {
};
exports.Shipment = Shipment;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        primaryKey: true,
    }),
    __metadata("design:type", String)
], Shipment.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
        field: 'organization_id',
    }),
    __metadata("design:type", String)
], Shipment.prototype, "organizationId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        field: 'booking_number',
    }),
    __metadata("design:type", String)
], Shipment.prototype, "bookingNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => customer_model_1.Customer),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
        field: 'customer_id',
    }),
    __metadata("design:type", String)
], Shipment.prototype, "customerId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => customer_model_1.Customer),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        field: 'consignee_id',
    }),
    __metadata("design:type", Object)
], Shipment.prototype, "consigneeId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: false,
        field: 'origin_city',
    }),
    __metadata("design:type", String)
], Shipment.prototype, "originCity", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(20),
        field: 'origin_pincode',
    }),
    __metadata("design:type", Object)
], Shipment.prototype, "originPincode", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: false,
        field: 'destination_city',
    }),
    __metadata("design:type", String)
], Shipment.prototype, "destinationCity", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(20),
        field: 'destination_pincode',
    }),
    __metadata("design:type", Object)
], Shipment.prototype, "destinationPincode", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'pickup_date',
    }),
    __metadata("design:type", Object)
], Shipment.prototype, "pickupDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'expected_delivery_date',
    }),
    __metadata("design:type", Object)
], Shipment.prototype, "expectedDeliveryDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('DRAFT', 'CREATED', 'VALIDATED', 'PLANNED', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'),
        defaultValue: 'CREATED',
    }),
    __metadata("design:type", String)
], Shipment.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.FLOAT,
        defaultValue: 0,
        field: 'total_weight_kg',
    }),
    __metadata("design:type", Number)
], Shipment.prototype, "totalWeightKg", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.FLOAT,
        defaultValue: 0,
        field: 'total_volume_cu_ft',
    }),
    __metadata("design:type", Number)
], Shipment.prototype, "totalVolumeCuFt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.FLOAT,
        defaultValue: 0,
        field: 'freight_amount',
    }),
    __metadata("design:type", Number)
], Shipment.prototype, "freightAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => shipment_item_model_1.ShipmentItem, { foreignKey: 'shipmentId', as: 'items' }),
    __metadata("design:type", Array)
], Shipment.prototype, "items", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => customer_model_1.Customer, { foreignKey: 'customerId', as: 'customer' }),
    __metadata("design:type", customer_model_1.Customer)
], Shipment.prototype, "customer", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => customer_model_1.Customer, { foreignKey: 'consigneeId', as: 'consignee' }),
    __metadata("design:type", Object)
], Shipment.prototype, "consignee", void 0);
exports.Shipment = Shipment = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'shipments',
        timestamps: true,
        paranoid: true,
        underscored: true,
    })
], Shipment);
//# sourceMappingURL=shipment.model.js.map