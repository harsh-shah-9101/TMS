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
exports.TripStop = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const trip_model_1 = require("./trip.model");
const shipment_model_1 = require("../../shipments/models/shipment.model");
let TripStop = class TripStop extends sequelize_typescript_1.Model {
};
exports.TripStop = TripStop;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        primaryKey: true,
    }),
    __metadata("design:type", String)
], TripStop.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        defaultValue: 1,
    }),
    __metadata("design:type", Number)
], TripStop.prototype, "sequence", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => trip_model_1.Trip),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
        field: 'trip_id',
    }),
    __metadata("design:type", String)
], TripStop.prototype, "tripId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => shipment_model_1.Shipment),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        field: 'shipment_id',
    }),
    __metadata("design:type", Object)
], TripStop.prototype, "shipmentId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('PICKUP', 'DROPOFF', 'HALT', 'CHECKPOINT'),
        defaultValue: 'PICKUP',
        field: 'stop_type',
    }),
    __metadata("design:type", String)
], TripStop.prototype, "stopType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        allowNull: false,
        field: 'location_name',
    }),
    __metadata("design:type", String)
], TripStop.prototype, "locationName", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: false,
    }),
    __metadata("design:type", String)
], TripStop.prototype, "city", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(20),
    }),
    __metadata("design:type", Object)
], TripStop.prototype, "pincode", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('PENDING', 'ARRIVED', 'COMPLETED', 'SKIPPED'),
        defaultValue: 'PENDING',
    }),
    __metadata("design:type", String)
], TripStop.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'arrival_time',
    }),
    __metadata("design:type", Object)
], TripStop.prototype, "arrivalTime", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        field: 'departure_time',
    }),
    __metadata("design:type", Object)
], TripStop.prototype, "departureTime", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
    }),
    __metadata("design:type", Object)
], TripStop.prototype, "remarks", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => trip_model_1.Trip),
    __metadata("design:type", trip_model_1.Trip)
], TripStop.prototype, "trip", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => shipment_model_1.Shipment),
    __metadata("design:type", shipment_model_1.Shipment)
], TripStop.prototype, "shipment", void 0);
exports.TripStop = TripStop = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'trip_stops',
        timestamps: true,
        underscored: true,
    })
], TripStop);
//# sourceMappingURL=trip-stop.model.js.map