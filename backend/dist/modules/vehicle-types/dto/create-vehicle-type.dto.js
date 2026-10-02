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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateVehicleTypeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateVehicleTypeDto {
    name;
    code;
    capacityTons;
    volumeCuFt;
    axleCount;
    fuelType;
    status;
}
exports.CreateVehicleTypeDto = CreateVehicleTypeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '32ft Multi-Axle Container', description: 'Name of the vehicle type' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateVehicleTypeDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '32MX', description: 'Unique vehicle type code within organization' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateVehicleTypeDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15.5, description: 'Payload capacity in metric tons' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.1, { message: 'Capacity must be greater than 0' }),
    __metadata("design:type", Number)
], CreateVehicleTypeDto.prototype, "capacityTons", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1850.0, description: 'Volumetric capacity in cubic feet' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateVehicleTypeDto.prototype, "volumeCuFt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 3, description: 'Number of axles' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2),
    __metadata("design:type", Number)
], CreateVehicleTypeDto.prototype, "axleCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.FuelType,
        default: client_1.FuelType.DIESEL,
        description: 'Fuel type used by vehicle category',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.FuelType),
    __metadata("design:type", typeof (_a = typeof client_1.FuelType !== "undefined" && client_1.FuelType) === "function" ? _a : Object)
], CreateVehicleTypeDto.prototype, "fuelType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: client_1.VehicleTypeStatus,
        default: client_1.VehicleTypeStatus.ACTIVE,
        description: 'Operational status of vehicle type',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.VehicleTypeStatus),
    __metadata("design:type", typeof (_b = typeof client_1.VehicleTypeStatus !== "undefined" && client_1.VehicleTypeStatus) === "function" ? _b : Object)
], CreateVehicleTypeDto.prototype, "status", void 0);
//# sourceMappingURL=create-vehicle-type.dto.js.map