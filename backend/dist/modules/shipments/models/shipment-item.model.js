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
exports.ShipmentItem = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const shipment_model_1 = require("./shipment.model");
let ShipmentItem = class ShipmentItem extends sequelize_typescript_1.Model {
};
exports.ShipmentItem = ShipmentItem;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        primaryKey: true,
    }),
    __metadata("design:type", String)
], ShipmentItem.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => shipment_model_1.Shipment),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
        field: 'shipment_id',
    }),
    __metadata("design:type", String)
], ShipmentItem.prototype, "shipmentId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        allowNull: false,
    }),
    __metadata("design:type", String)
], ShipmentItem.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 1,
    }),
    __metadata("design:type", Number)
], ShipmentItem.prototype, "quantity", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.FLOAT,
        defaultValue: 0,
        field: 'weight_kg',
    }),
    __metadata("design:type", Number)
], ShipmentItem.prototype, "weightKg", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.FLOAT,
        defaultValue: 0,
        field: 'volume_cu_ft',
    }),
    __metadata("design:type", Number)
], ShipmentItem.prototype, "volumeCuFt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.FLOAT,
        field: 'declared_value',
    }),
    __metadata("design:type", Object)
], ShipmentItem.prototype, "declaredValue", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => shipment_model_1.Shipment),
    __metadata("design:type", shipment_model_1.Shipment)
], ShipmentItem.prototype, "shipment", void 0);
exports.ShipmentItem = ShipmentItem = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'shipment_items',
        timestamps: true,
        underscored: true,
    })
], ShipmentItem);
//# sourceMappingURL=shipment-item.model.js.map