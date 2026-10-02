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
exports.Pod = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const trip_model_1 = require("../../trips/models/trip.model");
const shipment_model_1 = require("../../shipments/models/shipment.model");
let Pod = class Pod extends sequelize_typescript_1.Model {
};
exports.Pod = Pod;
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, defaultValue: sequelize_typescript_1.DataType.UUIDV4, primaryKey: true }),
    __metadata("design:type", String)
], Pod.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false, field: 'organization_id' }),
    __metadata("design:type", String)
], Pod.prototype, "organizationId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => shipment_model_1.Shipment),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false, field: 'shipment_id' }),
    __metadata("design:type", String)
], Pod.prototype, "shipmentId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => trip_model_1.Trip),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false, field: 'trip_id' }),
    __metadata("design:type", String)
], Pod.prototype, "tripId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, field: 'received_by' }),
    __metadata("design:type", Object)
], Pod.prototype, "receivedBy", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, field: 'signature_url' }),
    __metadata("design:type", Object)
], Pod.prototype, "signatureUrl", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.FLOAT, field: 'shortage_qty' }),
    __metadata("design:type", Object)
], Pod.prototype, "shortageQty", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => shipment_model_1.Shipment),
    __metadata("design:type", shipment_model_1.Shipment)
], Pod.prototype, "shipment", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => trip_model_1.Trip),
    __metadata("design:type", trip_model_1.Trip)
], Pod.prototype, "trip", void 0);
exports.Pod = Pod = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'pods',
        timestamps: true,
        underscored: true,
    })
], Pod);
//# sourceMappingURL=pod.model.js.map