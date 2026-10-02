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
exports.Dispatch = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const trip_model_1 = require("../../trips/models/trip.model");
let Dispatch = class Dispatch extends sequelize_typescript_1.Model {
};
exports.Dispatch = Dispatch;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        primaryKey: true,
    }),
    __metadata("design:type", String)
], Dispatch.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
        field: 'organization_id',
    }),
    __metadata("design:type", String)
], Dispatch.prototype, "organizationId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => trip_model_1.Trip),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        allowNull: false,
        field: 'trip_id',
    }),
    __metadata("design:type", String)
], Dispatch.prototype, "tripId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        field: 'dispatch_number',
    }),
    __metadata("design:type", String)
], Dispatch.prototype, "dispatchNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        field: 'gate_pass_number',
    }),
    __metadata("design:type", Object)
], Dispatch.prototype, "gatePassNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('DISPATCHED', 'GATE_OUT', 'CANCELLED'),
        defaultValue: 'DISPATCHED',
    }),
    __metadata("design:type", String)
], Dispatch.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        defaultValue: sequelize_typescript_1.DataType.NOW,
        field: 'dispatched_at',
    }),
    __metadata("design:type", Date)
], Dispatch.prototype, "dispatchedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        field: 'dispatched_by_user_id',
    }),
    __metadata("design:type", Object)
], Dispatch.prototype, "dispatchedByUserId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
    }),
    __metadata("design:type", Object)
], Dispatch.prototype, "remarks", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => trip_model_1.Trip),
    __metadata("design:type", trip_model_1.Trip)
], Dispatch.prototype, "trip", void 0);
exports.Dispatch = Dispatch = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'dispatches',
        timestamps: true,
        underscored: true,
    })
], Dispatch);
//# sourceMappingURL=dispatch.model.js.map