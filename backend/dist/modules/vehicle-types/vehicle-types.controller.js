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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleTypesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const vehicle_types_service_1 = require("./vehicle-types.service");
const create_vehicle_type_dto_1 = require("./dto/create-vehicle-type.dto");
const update_vehicle_type_dto_1 = require("./dto/update-vehicle-type.dto");
const query_vehicle_type_dto_1 = require("./dto/query-vehicle-type.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const enums_1 = require("../../common/enums");
let VehicleTypesController = class VehicleTypesController {
    vehicleTypesService;
    constructor(vehicleTypesService) {
        this.vehicleTypesService = vehicleTypesService;
    }
    create(user, dto) {
        return this.vehicleTypesService.create(user.organizationId, dto);
    }
    findAll(user, query) {
        return this.vehicleTypesService.findAll(user.organizationId, query);
    }
    findOne(user, id) {
        return this.vehicleTypesService.findOne(user.organizationId, id);
    }
    update(user, id, dto) {
        return this.vehicleTypesService.update(user.organizationId, id, dto);
    }
    remove(user, id) {
        return this.vehicleTypesService.remove(user.organizationId, id);
    }
};
exports.VehicleTypesController = VehicleTypesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(enums_1.RoleName.ADMIN, enums_1.RoleName.FLEET_MANAGER, enums_1.RoleName.TRANSPORT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new vehicle type' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Vehicle type created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request / validation error' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Vehicle type code already exists in organization' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_vehicle_type_dto_1.CreateVehicleTypeDto]),
    __metadata("design:returntype", void 0)
], VehicleTypesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.RoleName.ADMIN, enums_1.RoleName.FLEET_MANAGER, enums_1.RoleName.TRANSPORT_MANAGER, enums_1.RoleName.DISPATCHER, enums_1.RoleName.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'List vehicle types with search and pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated list of vehicle types' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_vehicle_type_dto_1.QueryVehicleTypeDto]),
    __metadata("design:returntype", void 0)
], VehicleTypesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.RoleName.ADMIN, enums_1.RoleName.FLEET_MANAGER, enums_1.RoleName.TRANSPORT_MANAGER, enums_1.RoleName.DISPATCHER, enums_1.RoleName.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'Get vehicle type details by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vehicle type details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle type not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], VehicleTypesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.RoleName.ADMIN, enums_1.RoleName.FLEET_MANAGER, enums_1.RoleName.TRANSPORT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update vehicle type' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vehicle type updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle type not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Duplicate vehicle type code' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_vehicle_type_dto_1.UpdateVehicleTypeDto]),
    __metadata("design:returntype", void 0)
], VehicleTypesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.RoleName.ADMIN, enums_1.RoleName.FLEET_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete vehicle type' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vehicle type deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle type not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], VehicleTypesController.prototype, "remove", null);
exports.VehicleTypesController = VehicleTypesController = __decorate([
    (0, swagger_1.ApiTags)('Vehicle Types'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('vehicle-types'),
    __metadata("design:paramtypes", [vehicle_types_service_1.VehicleTypesService])
], VehicleTypesController);
//# sourceMappingURL=vehicle-types.controller.js.map