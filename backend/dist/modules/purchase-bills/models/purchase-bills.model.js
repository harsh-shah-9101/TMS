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
exports.PurchaseBill = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const carrier_model_1 = require("../../carriers/models/carrier.model");
let PurchaseBill = class PurchaseBill extends sequelize_typescript_1.Model {
};
exports.PurchaseBill = PurchaseBill;
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, defaultValue: sequelize_typescript_1.DataType.UUIDV4, primaryKey: true }),
    __metadata("design:type", String)
], PurchaseBill.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false, field: 'organization_id' }),
    __metadata("design:type", String)
], PurchaseBill.prototype, "organizationId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => carrier_model_1.Carrier),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, field: 'carrier_id' }),
    __metadata("design:type", Object)
], PurchaseBill.prototype, "carrierId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.FLOAT, allowNull: false, field: 'amount' }),
    __metadata("design:type", Number)
], PurchaseBill.prototype, "amount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false, defaultValue: 'PENDING', field: 'status' }),
    __metadata("design:type", String)
], PurchaseBill.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, field: 'due_date' }),
    __metadata("design:type", Object)
], PurchaseBill.prototype, "dueDate", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => carrier_model_1.Carrier),
    __metadata("design:type", carrier_model_1.Carrier)
], PurchaseBill.prototype, "carrier", void 0);
exports.PurchaseBill = PurchaseBill = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'purchase_bills',
        timestamps: true,
        underscored: true,
    })
], PurchaseBill);
//# sourceMappingURL=purchase-bills.model.js.map