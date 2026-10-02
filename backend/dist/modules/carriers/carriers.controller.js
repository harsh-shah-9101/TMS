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
exports.CarriersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const carriers_service_1 = require("./carriers.service");
const create_carrier_dto_1 = require("./dto/create-carrier.dto");
const update_carrier_dto_1 = require("./dto/update-carrier.dto");
const query_carrier_dto_1 = require("./dto/query-carrier.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const enums_1 = require("../../common/enums");
let CarriersController = class CarriersController {
    carriersService;
    constructor(carriersService) {
        this.carriersService = carriersService;
    }
    create(user, dto) {
        return this.carriersService.create(user.organizationId, dto);
    }
    findAll(user, query) {
        return this.carriersService.findAll(user.organizationId, query);
    }
    findOne(user, id) {
        return this.carriersService.findOne(user.organizationId, id);
    }
    update(user, id, dto) {
        return this.carriersService.update(user.organizationId, id, dto);
    }
    remove(user, id) {
        return this.carriersService.remove(user.organizationId, id);
    }
};
exports.CarriersController = CarriersController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(enums_1.RoleName.ADMIN, enums_1.RoleName.TRANSPORT_MANAGER, enums_1.RoleName.ACCOUNTS),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new carrier / transporter' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Carrier created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error / invalid GSTIN or PAN' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Carrier code already exists in organization' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_carrier_dto_1.CreateCarrierDto]),
    __metadata("design:returntype", void 0)
], CarriersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.RoleName.ADMIN, enums_1.RoleName.TRANSPORT_MANAGER, enums_1.RoleName.DISPATCHER, enums_1.RoleName.ACCOUNTS, enums_1.RoleName.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'List carriers with search, status filter, and pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated list of carriers' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_carrier_dto_1.QueryCarrierDto]),
    __metadata("design:returntype", void 0)
], CarriersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.RoleName.ADMIN, enums_1.RoleName.TRANSPORT_MANAGER, enums_1.RoleName.DISPATCHER, enums_1.RoleName.ACCOUNTS, enums_1.RoleName.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'Get carrier details by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Carrier details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Carrier not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CarriersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.RoleName.ADMIN, enums_1.RoleName.TRANSPORT_MANAGER, enums_1.RoleName.ACCOUNTS),
    (0, swagger_1.ApiOperation)({ summary: 'Update carrier details & rating' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Carrier updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Carrier not found' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Duplicate carrier code' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_carrier_dto_1.UpdateCarrierDto]),
    __metadata("design:returntype", void 0)
], CarriersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.RoleName.ADMIN, enums_1.RoleName.ACCOUNTS),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete carrier' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Carrier deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Carrier not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CarriersController.prototype, "remove", null);
exports.CarriersController = CarriersController = __decorate([
    (0, swagger_1.ApiTags)('Carriers & Transporters'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('carriers'),
    __metadata("design:paramtypes", [carriers_service_1.CarriersService])
], CarriersController);
//# sourceMappingURL=carriers.controller.js.map