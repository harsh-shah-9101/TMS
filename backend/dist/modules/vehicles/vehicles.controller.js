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
exports.VehiclesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const vehicles_service_1 = require("./vehicles.service");
const create_vehicle_dto_1 = require("./dto/create-vehicle.dto");
const update_vehicle_dto_1 = require("./dto/update-vehicle.dto");
const query_vehicle_dto_1 = require("./dto/query-vehicle.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const enums_1 = require("../../common/enums");
let VehiclesController = class VehiclesController {
    vehiclesService;
    constructor(vehiclesService) {
        this.vehiclesService = vehiclesService;
    }
    create(user, dto) {
        return this.vehiclesService.create(user.organizationId, dto);
    }
    findAll(user, query) {
        return this.vehiclesService.findAll(user.organizationId, query);
    }
    findOne(user, id) {
        return this.vehiclesService.findOne(user.organizationId, id);
    }
    update(user, id, dto) {
        return this.vehiclesService.update(user.organizationId, id, dto);
    }
    remove(user, id) {
        return this.vehiclesService.remove(user.organizationId, id);
    }
};
exports.VehiclesController = VehiclesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(enums_1.RoleName.ADMIN, enums_1.RoleName.FLEET_MANAGER, enums_1.RoleName.TRANSPORT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new vehicle' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Vehicle registered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request / invalid vehicle type' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Vehicle registration number already exists in organization' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_vehicle_dto_1.CreateVehicleDto]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.RoleName.ADMIN, enums_1.RoleName.FLEET_MANAGER, enums_1.RoleName.TRANSPORT_MANAGER, enums_1.RoleName.DISPATCHER, enums_1.RoleName.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'List vehicles with filtering and pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated list of organization vehicles' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_vehicle_dto_1.QueryVehicleDto]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.RoleName.ADMIN, enums_1.RoleName.FLEET_MANAGER, enums_1.RoleName.TRANSPORT_MANAGER, enums_1.RoleName.DISPATCHER, enums_1.RoleName.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'Get vehicle details by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vehicle details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.RoleName.ADMIN, enums_1.RoleName.FLEET_MANAGER, enums_1.RoleName.TRANSPORT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update vehicle details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vehicle updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Duplicate registration number' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_vehicle_dto_1.UpdateVehicleDto]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.RoleName.ADMIN, enums_1.RoleName.FLEET_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete vehicle' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vehicle deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "remove", null);
exports.VehiclesController = VehiclesController = __decorate([
    (0, swagger_1.ApiTags)('Vehicles'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('vehicles'),
    __metadata("design:paramtypes", [vehicles_service_1.VehiclesService])
], VehiclesController);
//# sourceMappingURL=vehicles.controller.js.map