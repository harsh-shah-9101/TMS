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
exports.CreateShipmentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const enums_1 = require("../../../common/enums");
const create_shipment_item_dto_1 = require("./create-shipment-item.dto");
class CreateShipmentDto {
    bookingNumber;
    customerId;
    consigneeId;
    originCity;
    originPincode;
    destinationCity;
    destinationPincode;
    pickupDate;
    expectedDeliveryDate;
    status;
    freightAmount;
    items;
}
exports.CreateShipmentDto = CreateShipmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'BK-2026-0001', description: 'Booking reference number (unique per organization)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateShipmentDto.prototype, "bookingNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Customer / Shipper ID' }),
    (0, class_validator_1.IsUUID)('4'),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateShipmentDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', description: 'Consignee / Receiver Customer ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4'),
    __metadata("design:type", String)
], CreateShipmentDto.prototype, "consigneeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mumbai', description: 'Origin city' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateShipmentDto.prototype, "originCity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '400001', description: 'Origin pincode' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShipmentDto.prototype, "originPincode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bengaluru', description: 'Destination city' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateShipmentDto.prototype, "destinationCity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '560001', description: 'Destination pincode' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateShipmentDto.prototype, "destinationPincode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-10-05T10:00:00.000Z', description: 'Pickup schedule date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateShipmentDto.prototype, "pickupDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-10-08T18:00:00.000Z', description: 'Expected delivery date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateShipmentDto.prototype, "expectedDeliveryDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: enums_1.ShipmentStatus,
        default: enums_1.ShipmentStatus.CREATED,
        description: 'Initial status (DRAFT, CREATED, VALIDATED)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.ShipmentStatus),
    __metadata("design:type", String)
], CreateShipmentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 45000.0, default: 0, description: 'Agreed freight amount in INR' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateShipmentDto.prototype, "freightAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [create_shipment_item_dto_1.CreateShipmentItemDto], description: 'List of shipment items' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => create_shipment_item_dto_1.CreateShipmentItemDto),
    __metadata("design:type", Array)
], CreateShipmentDto.prototype, "items", void 0);
//# sourceMappingURL=create-shipment.dto.js.map