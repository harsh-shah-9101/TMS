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
exports.Trip = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const route_model_1 = require("../../routes/models/route.model");
const vehicle_model_1 = require("../../vehicles/models/vehicle.model");
const driver_model_1 = require("../../drivers/models/driver.model");
const carrier_model_1 = require("../../carriers/models/carrier.model");
const trip_stop_model_1 = require("./trip-stop.model");
let Trip = class Trip extends sequelize_typescript_1.Model {
};
exports.Trip = Trip;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        primaryKey: true,
    }),
    __metadata("design:type", String)
], Trip.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
        field: 'organization_id',
    }),
    __metadata("design:type", String)
], Trip.prototype, "organizationId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        field: 'trip_number',
    }),
    __metadata("design:type", String)
], Trip.prototype, "tripNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => route_model_1.Route),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        field: 'route_id',
    }),
    __metadata("design:type", Object)
], Trip.prototype, "routeId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => vehicle_model_1.Vehicle),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        field: 'vehicle_id',
    }),
    __metadata("design:type", Object)
], Trip.prototype, "vehicleId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => driver_model_1.Driver),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        field: 'driver_id',
    }),
    __metadata("design:type", Object)
], Trip.prototype, "driverId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => carrier_model_1.Carrier),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        field: 'carrier_id',
    }),
    __metadata("design:type", Object)
], Trip.prototype, "carrierId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('PLANNED', 'ASSIGNED', 'DISPATCHED', 'IN_TRANSIT', 'PAUSED', 'COMPLETED', 'CANCELLED'),
        defaultValue: 'PLANNED',
    }),
    __metadata("design:type", String)
], Trip.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'planned_start_date',
    }),
    __metadata("design:type", Object)
], Trip.prototype, "plannedStartDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'planned_end_date',
    }),
    __metadata("design:type", Object)
], Trip.prototype, "plannedEndDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'actual_start_date',
    }),
    __metadata("design:type", Object)
], Trip.prototype, "actualStartDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'actual_end_date',
    }),
    __metadata("design:type", Object)
], Trip.prototype, "actualEndDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.FLOAT,
        field: 'start_odometer',
    }),
    __metadata("design:type", Object)
], Trip.prototype, "startOdometer", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.FLOAT,
        field: 'end_odometer',
    }),
    __metadata("design:type", Object)
], Trip.prototype, "endOdometer", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
    }),
    __metadata("design:type", Object)
], Trip.prototype, "remarks", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => route_model_1.Route),
    __metadata("design:type", route_model_1.Route)
], Trip.prototype, "route", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => vehicle_model_1.Vehicle),
    __metadata("design:type", vehicle_model_1.Vehicle)
], Trip.prototype, "vehicle", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => driver_model_1.Driver),
    __metadata("design:type", driver_model_1.Driver)
], Trip.prototype, "driver", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => carrier_model_1.Carrier),
    __metadata("design:type", carrier_model_1.Carrier)
], Trip.prototype, "carrier", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => trip_stop_model_1.TripStop),
    __metadata("design:type", Array)
], Trip.prototype, "stops", void 0);
exports.Trip = Trip = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'trips',
        timestamps: true,
        paranoid: true,
        underscored: true,
    })
], Trip);
//# sourceMappingURL=trip.model.js.map