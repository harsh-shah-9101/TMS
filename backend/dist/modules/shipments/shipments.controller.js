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
exports.ShipmentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shipments_service_1 = require("./shipments.service");
const create_shipment_dto_1 = require("./dto/create-shipment.dto");
const update_shipment_dto_1 = require("./dto/update-shipment.dto");
const update_shipment_status_dto_1 = require("./dto/update-shipment-status.dto");
const query_shipment_dto_1 = require("./dto/query-shipment.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const enums_1 = require("../../common/enums");
let ShipmentsController = class ShipmentsController {
    shipmentsService;
    constructor(shipmentsService) {
        this.shipmentsService = shipmentsService;
    }
    create(user, dto) {
        return this.shipmentsService.create(user.organizationId, dto);
    }
    findAll(user, query) {
        return this.shipmentsService.findAll(user.organizationId, query);
    }
    findOne(user, id) {
        return this.shipmentsService.findOne(user.organizationId, id);
    }
    updateStatus(user, id, dto) {
        return this.shipmentsService.updateStatus(user.organizationId, id, dto);
    }
    update(user, id, dto) {
        return this.shipmentsService.update(user.organizationId, id, dto);
    }
    remove(user, id) {
        return this.shipmentsService.remove(user.organizationId, id);
    }
};
exports.ShipmentsController = ShipmentsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(enums_1.RoleName.ADMIN, enums_1.RoleName.TRANSPORT_MANAGER, enums_1.RoleName.DISPATCHER),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new freight shipment / booking' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Shipment created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request / invalid customer' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Booking number already exists in organization' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_shipment_dto_1.CreateShipmentDto]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.RoleName.ADMIN, enums_1.RoleName.TRANSPORT_MANAGER, enums_1.RoleName.DISPATCHER, enums_1.RoleName.FLEET_MANAGER, enums_1.RoleName.ACCOUNTS, enums_1.RoleName.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'List shipments with search, status filter, and pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated list of shipments' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_shipment_dto_1.QueryShipmentDto]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.RoleName.ADMIN, enums_1.RoleName.TRANSPORT_MANAGER, enums_1.RoleName.DISPATCHER, enums_1.RoleName.FLEET_MANAGER, enums_1.RoleName.ACCOUNTS, enums_1.RoleName.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'Get shipment details by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shipment details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shipment not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.RoleName.ADMIN, enums_1.RoleName.TRANSPORT_MANAGER, enums_1.RoleName.DISPATCHER),
    (0, swagger_1.ApiOperation)({ summary: 'Update shipment status transition (Strict workflow rules)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shipment status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid status transition' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shipment not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_shipment_status_dto_1.UpdateShipmentStatusDto]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.RoleName.ADMIN, enums_1.RoleName.TRANSPORT_MANAGER, enums_1.RoleName.DISPATCHER),
    (0, swagger_1.ApiOperation)({ summary: 'Update shipment booking details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shipment updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shipment not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_shipment_dto_1.UpdateShipmentDto]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.RoleName.ADMIN, enums_1.RoleName.TRANSPORT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete shipment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Shipment deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Shipment not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ShipmentsController.prototype, "remove", null);
exports.ShipmentsController = ShipmentsController = __decorate([
    (0, swagger_1.ApiTags)('Shipments & Bookings'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('shipments'),
    __metadata("design:paramtypes", [shipments_service_1.ShipmentsService])
], ShipmentsController);
//# sourceMappingURL=shipments.controller.js.map