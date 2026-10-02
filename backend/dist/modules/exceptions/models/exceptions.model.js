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
exports.ExceptionRecord = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const vehicle_model_1 = require("../../vehicles/models/vehicle.model");
const trip_model_1 = require("../../trips/models/trip.model");
let ExceptionRecord = class ExceptionRecord extends sequelize_typescript_1.Model {
};
exports.ExceptionRecord = ExceptionRecord;
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, defaultValue: sequelize_typescript_1.DataType.UUIDV4, primaryKey: true }),
    __metadata("design:type", String)
], ExceptionRecord.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false, field: 'organization_id' }),
    __metadata("design:type", String)
], ExceptionRecord.prototype, "organizationId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => trip_model_1.Trip),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, field: 'trip_id' }),
    __metadata("design:type", Object)
], ExceptionRecord.prototype, "tripId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => vehicle_model_1.Vehicle),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, field: 'vehicle_id' }),
    __metadata("design:type", Object)
], ExceptionRecord.prototype, "vehicleId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false, field: 'type' }),
    __metadata("design:type", String)
], ExceptionRecord.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false, defaultValue: 'LOW', field: 'severity' }),
    __metadata("design:type", String)
], ExceptionRecord.prototype, "severity", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, field: 'description' }),
    __metadata("design:type", Object)
], ExceptionRecord.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => trip_model_1.Trip),
    __metadata("design:type", trip_model_1.Trip)
], ExceptionRecord.prototype, "trip", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => vehicle_model_1.Vehicle),
    __metadata("design:type", vehicle_model_1.Vehicle)
], ExceptionRecord.prototype, "vehicle", void 0);
exports.ExceptionRecord = ExceptionRecord = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'exceptions',
        timestamps: true,
        underscored: true,
    })
], ExceptionRecord);
//# sourceMappingURL=exceptions.model.js.map