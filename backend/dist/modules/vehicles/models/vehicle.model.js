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
exports.Vehicle = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const vehicle_types_model_1 = require("../../vehicle-types/models/vehicle-types.model");
let Vehicle = class Vehicle extends sequelize_typescript_1.Model {
};
exports.Vehicle = Vehicle;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        primaryKey: true,
    }),
    __metadata("design:type", String)
], Vehicle.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
        field: 'organization_id',
    }),
    __metadata("design:type", String)
], Vehicle.prototype, "organizationId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => vehicle_types_model_1.VehicleType),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
        field: 'vehicle_type_id',
    }),
    __metadata("design:type", String)
], Vehicle.prototype, "vehicleTypeId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => vehicle_types_model_1.VehicleType),
    __metadata("design:type", vehicle_types_model_1.VehicleType)
], Vehicle.prototype, "vehicleType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        field: 'registration_number',
    }),
    __metadata("design:type", String)
], Vehicle.prototype, "registrationNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: true,
        field: 'chassis_number',
    }),
    __metadata("design:type", String)
], Vehicle.prototype, "chassisNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: true,
        field: 'engine_number',
    }),
    __metadata("design:type", String)
], Vehicle.prototype, "engineNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: true,
    }),
    __metadata("design:type", String)
], Vehicle.prototype, "make", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: true,
    }),
    __metadata("design:type", String)
], Vehicle.prototype, "model", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
    }),
    __metadata("design:type", Number)
], Vehicle.prototype, "year", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: true,
        field: 'ownership_type',
    }),
    __metadata("design:type", String)
], Vehicle.prototype, "ownershipType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.FLOAT,
        defaultValue: 0,
        field: 'current_odometer',
    }),
    __metadata("design:type", Number)
], Vehicle.prototype, "currentOdometer", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        defaultValue: 'AVAILABLE',
    }),
    __metadata("design:type", String)
], Vehicle.prototype, "status", void 0);
exports.Vehicle = Vehicle = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'vehicles',
        timestamps: true,
        paranoid: true,
        underscored: true,
    })
], Vehicle);
//# sourceMappingURL=vehicle.model.js.map