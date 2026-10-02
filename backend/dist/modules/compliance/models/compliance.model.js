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
exports.ComplianceDocument = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const vehicle_model_1 = require("../../vehicles/models/vehicle.model");
const driver_model_1 = require("../../drivers/models/driver.model");
let ComplianceDocument = class ComplianceDocument extends sequelize_typescript_1.Model {
};
exports.ComplianceDocument = ComplianceDocument;
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, defaultValue: sequelize_typescript_1.DataType.UUIDV4, primaryKey: true }),
    __metadata("design:type", String)
], ComplianceDocument.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false, field: 'organization_id' }),
    __metadata("design:type", String)
], ComplianceDocument.prototype, "organizationId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => vehicle_model_1.Vehicle),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, field: 'vehicle_id' }),
    __metadata("design:type", Object)
], ComplianceDocument.prototype, "vehicleId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => driver_model_1.Driver),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, field: 'driver_id' }),
    __metadata("design:type", Object)
], ComplianceDocument.prototype, "driverId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false, field: 'type' }),
    __metadata("design:type", String)
], ComplianceDocument.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: false, field: 'expiry_date' }),
    __metadata("design:type", Date)
], ComplianceDocument.prototype, "expiryDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, field: 'document_url' }),
    __metadata("design:type", Object)
], ComplianceDocument.prototype, "documentUrl", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => vehicle_model_1.Vehicle),
    __metadata("design:type", vehicle_model_1.Vehicle)
], ComplianceDocument.prototype, "vehicle", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => driver_model_1.Driver),
    __metadata("design:type", driver_model_1.Driver)
], ComplianceDocument.prototype, "driver", void 0);
exports.ComplianceDocument = ComplianceDocument = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'compliance_documents',
        timestamps: true,
        underscored: true,
    })
], ComplianceDocument);
//# sourceMappingURL=compliance.model.js.map