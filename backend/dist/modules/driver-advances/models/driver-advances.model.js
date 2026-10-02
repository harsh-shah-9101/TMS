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
exports.DriverAdvance = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const driver_model_1 = require("../../drivers/models/driver.model");
const trip_model_1 = require("../../trips/models/trip.model");
let DriverAdvance = class DriverAdvance extends sequelize_typescript_1.Model {
};
exports.DriverAdvance = DriverAdvance;
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, defaultValue: sequelize_typescript_1.DataType.UUIDV4, primaryKey: true }),
    __metadata("design:type", String)
], DriverAdvance.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false, field: 'organization_id' }),
    __metadata("design:type", String)
], DriverAdvance.prototype, "organizationId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => driver_model_1.Driver),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false, field: 'driver_id' }),
    __metadata("design:type", String)
], DriverAdvance.prototype, "driverId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => trip_model_1.Trip),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, field: 'trip_id' }),
    __metadata("design:type", Object)
], DriverAdvance.prototype, "tripId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.FLOAT, allowNull: false, field: 'amount' }),
    __metadata("design:type", Number)
], DriverAdvance.prototype, "amount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: false, field: 'date' }),
    __metadata("design:type", Date)
], DriverAdvance.prototype, "date", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, field: 'reason' }),
    __metadata("design:type", Object)
], DriverAdvance.prototype, "reason", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => driver_model_1.Driver),
    __metadata("design:type", driver_model_1.Driver)
], DriverAdvance.prototype, "driver", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => trip_model_1.Trip),
    __metadata("design:type", trip_model_1.Trip)
], DriverAdvance.prototype, "trip", void 0);
exports.DriverAdvance = DriverAdvance = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'driver_advances',
        timestamps: true,
        underscored: true,
    })
], DriverAdvance);
//# sourceMappingURL=driver-advances.model.js.map