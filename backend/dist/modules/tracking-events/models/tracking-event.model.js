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
exports.TrackingEvent = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const trip_model_1 = require("../../trips/models/trip.model");
const vehicle_model_1 = require("../../vehicles/models/vehicle.model");
const driver_model_1 = require("../../drivers/models/driver.model");
const shipment_model_1 = require("../../shipments/models/shipment.model");
let TrackingEvent = class TrackingEvent extends sequelize_typescript_1.Model {
};
exports.TrackingEvent = TrackingEvent;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        primaryKey: true,
    }),
    __metadata("design:type", String)
], TrackingEvent.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
        field: 'organization_id',
    }),
    __metadata("design:type", String)
], TrackingEvent.prototype, "organizationId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => trip_model_1.Trip),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        field: 'trip_id',
    }),
    __metadata("design:type", Object)
], TrackingEvent.prototype, "tripId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => vehicle_model_1.Vehicle),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        field: 'vehicle_id',
    }),
    __metadata("design:type", Object)
], TrackingEvent.prototype, "vehicleId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => driver_model_1.Driver),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        field: 'driver_id',
    }),
    __metadata("design:type", Object)
], TrackingEvent.prototype, "driverId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => shipment_model_1.Shipment),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        field: 'shipment_id',
    }),
    __metadata("design:type", Object)
], TrackingEvent.prototype, "shipmentId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        field: 'event_type',
    }),
    __metadata("design:type", String)
], TrackingEvent.prototype, "eventType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
    }),
    __metadata("design:type", Object)
], TrackingEvent.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.FLOAT,
    }),
    __metadata("design:type", Object)
], TrackingEvent.prototype, "latitude", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.FLOAT,
    }),
    __metadata("design:type", Object)
], TrackingEvent.prototype, "longitude", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        allowNull: false,
        field: 'event_time',
    }),
    __metadata("design:type", Date)
], TrackingEvent.prototype, "eventTime", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.JSONB,
    }),
    __metadata("design:type", Object)
], TrackingEvent.prototype, "metadata", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        defaultValue: 'SYSTEM',
    }),
    __metadata("design:type", String)
], TrackingEvent.prototype, "source", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => trip_model_1.Trip),
    __metadata("design:type", trip_model_1.Trip)
], TrackingEvent.prototype, "trip", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => vehicle_model_1.Vehicle),
    __metadata("design:type", vehicle_model_1.Vehicle)
], TrackingEvent.prototype, "vehicle", void 0);
exports.TrackingEvent = TrackingEvent = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'tracking_events',
        timestamps: true,
        updatedAt: false,
        paranoid: false,
        underscored: true,
        indexes: [
            { fields: ['organization_id'] },
            { fields: ['trip_id'] },
            { fields: ['vehicle_id'] },
            { fields: ['event_time'] },
        ],
    })
], TrackingEvent);
//# sourceMappingURL=tracking-event.model.js.map