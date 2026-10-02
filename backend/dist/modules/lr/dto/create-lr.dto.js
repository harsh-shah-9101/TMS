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
exports.CreateLrDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const enums_1 = require("../../../common/enums");
class CreateLrDto {
    shipmentId;
    lrNumber;
    consignorName;
    consignorAddress;
    consigneeName;
    consigneeAddress;
    freightTerms;
    basicFreight;
    otherCharges;
    taxAmount;
    remarks;
    status;
}
exports.CreateLrDto = CreateLrDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Associated shipment ID' }),
    (0, class_validator_1.IsUUID)('4'),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLrDto.prototype, "shipmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'LR-2026-001', description: 'Unique Lorry Receipt Number within organization' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLrDto.prototype, "lrNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Reliance Industries Ltd', description: 'Consignor Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLrDto.prototype, "consignorName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Maker Chambers IV, Nariman Point, Mumbai', description: 'Consignor Address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLrDto.prototype, "consignorAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'TCS Ltd', description: 'Consignee Name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateLrDto.prototype, "consigneeName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Electronics City, Bengaluru', description: 'Consignee Address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLrDto.prototype, "consigneeAddress", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: enums_1.FreightTerm,
        default: enums_1.FreightTerm.TO_PAY,
        description: 'Freight Payment Terms (PAID, TO_PAY, TO_BE_BILLED)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.FreightTerm),
    __metadata("design:type", String)
], CreateLrDto.prototype, "freightTerms", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 40000.0, default: 0, description: 'Basic Freight Charge' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateLrDto.prototype, "basicFreight", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2500.0, default: 0, description: 'Loading/Unloading & Other Charges' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateLrDto.prototype, "otherCharges", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 2500.0, default: 0, description: 'GST / Tax Amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateLrDto.prototype, "taxAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Handle with care. Temperature sensitive.', description: 'Remarks / Special Instructions' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLrDto.prototype, "remarks", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: enums_1.LRStatus,
        default: enums_1.LRStatus.ISSUED,
        description: 'LR Document Status (ISSUED, CANCELLED)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.LRStatus),
    __metadata("design:type", String)
], CreateLrDto.prototype, "status", void 0);
//# sourceMappingURL=create-lr.dto.js.map