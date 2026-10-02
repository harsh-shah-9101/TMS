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
exports.FuelLog = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const vehicle_model_1 = require("../../vehicles/models/vehicle.model");
const driver_model_1 = require("../../drivers/models/driver.model");
let FuelLog = class FuelLog extends sequelize_typescript_1.Model {
};
exports.FuelLog = FuelLog;
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, defaultValue: sequelize_typescript_1.DataType.UUIDV4, primaryKey: true }),
    __metadata("design:type", String)
], FuelLog.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false, field: 'organization_id' }),
    __metadata("design:type", String)
], FuelLog.prototype, "organizationId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => vehicle_model_1.Vehicle),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false, field: 'vehicle_id' }),
    __metadata("design:type", String)
], FuelLog.prototype, "vehicleId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => driver_model_1.Driver),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, field: 'driver_id' }),
    __metadata("design:type", Object)
], FuelLog.prototype, "driverId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.FLOAT, allowNull: false, field: 'quantity' }),
    __metadata("design:type", Number)
], FuelLog.prototype, "quantity", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.FLOAT, allowNull: false, field: 'cost' }),
    __metadata("design:type", Number)
], FuelLog.prototype, "cost", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.FLOAT, field: 'odometer' }),
    __metadata("design:type", Object)
], FuelLog.prototype, "odometer", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: false, field: 'date' }),
    __metadata("design:type", Date)
], FuelLog.prototype, "date", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => vehicle_model_1.Vehicle),
    __metadata("design:type", vehicle_model_1.Vehicle)
], FuelLog.prototype, "vehicle", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => driver_model_1.Driver),
    __metadata("design:type", driver_model_1.Driver)
], FuelLog.prototype, "driver", void 0);
exports.FuelLog = FuelLog = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'fuel_logs',
        timestamps: true,
        underscored: true,
    })
], FuelLog);
//# sourceMappingURL=fuel.model.js.map