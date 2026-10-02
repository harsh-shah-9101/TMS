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
exports.CreateRouteDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const enums_1 = require("../../../common/enums");
class CreateRouteDto {
    name;
    code;
    originCity;
    originState;
    destinationCity;
    destinationState;
    distanceKm;
    estimatedHours;
    status;
}
exports.CreateRouteDto = CreateRouteDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mumbai to Bengaluru Express Corridor', description: 'Route display name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRouteDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'RT-MUM-BLR', description: 'Unique route code within organization' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRouteDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mumbai', description: 'Origin city' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRouteDto.prototype, "originCity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Maharashtra', description: 'Origin state' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRouteDto.prototype, "originState", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bengaluru', description: 'Destination city' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRouteDto.prototype, "destinationCity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Karnataka', description: 'Destination state' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRouteDto.prototype, "destinationState", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 980.5, default: 0, description: 'Route distance in kilometers' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateRouteDto.prototype, "distanceKm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 22.5, default: 0, description: 'Estimated transit duration in hours' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateRouteDto.prototype, "estimatedHours", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        enum: enums_1.RouteStatus,
        default: enums_1.RouteStatus.ACTIVE,
        description: 'Route operational status',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.RouteStatus),
    __metadata("design:type", String)
], CreateRouteDto.prototype, "status", void 0);
//# sourceMappingURL=create-route.dto.js.map