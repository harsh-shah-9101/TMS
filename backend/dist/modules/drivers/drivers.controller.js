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
exports.DriversController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const drivers_service_1 = require("./drivers.service");
const create_driver_dto_1 = require("./dto/create-driver.dto");
const update_driver_dto_1 = require("./dto/update-driver.dto");
const query_driver_dto_1 = require("./dto/query-driver.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let DriversController = class DriversController {
    driversService;
    constructor(driversService) {
        this.driversService = driversService;
    }
    create(user, dto) {
        return this.driversService.create(user.organizationId, dto);
    }
    findAll(user, query) {
        return this.driversService.findAll(user.organizationId, query);
    }
    findOne(user, id) {
        return this.driversService.findOne(user.organizationId, id);
    }
    update(user, id, dto) {
        return this.driversService.update(user.organizationId, id, dto);
    }
    remove(user, id) {
        return this.driversService.remove(user.organizationId, id);
    }
};
exports.DriversController = DriversController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.FLEET_MANAGER, client_1.RoleName.TRANSPORT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new driver' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Driver registered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request / invalid user account link' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Driver license number already exists in organization' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_driver_dto_1.CreateDriverDto]),
    __metadata("design:returntype", void 0)
], DriversController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.FLEET_MANAGER, client_1.RoleName.TRANSPORT_MANAGER, client_1.RoleName.DISPATCHER, client_1.RoleName.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'List drivers with filtering and pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated list of drivers' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_driver_dto_1.QueryDriverDto]),
    __metadata("design:returntype", void 0)
], DriversController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.FLEET_MANAGER, client_1.RoleName.TRANSPORT_MANAGER, client_1.RoleName.DISPATCHER, client_1.RoleName.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'Get driver details by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Driver details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Driver not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DriversController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.FLEET_MANAGER, client_1.RoleName.TRANSPORT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update driver details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Driver updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Driver not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Duplicate license number' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_driver_dto_1.UpdateDriverDto]),
    __metadata("design:returntype", void 0)
], DriversController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.FLEET_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete driver' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Driver deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Driver not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], DriversController.prototype, "remove", null);
exports.DriversController = DriversController = __decorate([
    (0, swagger_1.ApiTags)('Drivers'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('drivers'),
    __metadata("design:paramtypes", [drivers_service_1.DriversService])
], DriversController);
//# sourceMappingURL=drivers.controller.js.map