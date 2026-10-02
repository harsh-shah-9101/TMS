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
exports.LrController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const lr_service_1 = require("./lr.service");
const create_lr_dto_1 = require("./dto/create-lr.dto");
const update_lr_dto_1 = require("./dto/update-lr.dto");
const query_lr_dto_1 = require("./dto/query-lr.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const enums_1 = require("../../common/enums");
let LrController = class LrController {
    lrService;
    constructor(lrService) {
        this.lrService = lrService;
    }
    create(user, dto) {
        return this.lrService.create(user.organizationId, dto);
    }
    findAll(user, query) {
        return this.lrService.findAll(user.organizationId, query);
    }
    findOne(user, id) {
        return this.lrService.findOne(user.organizationId, id);
    }
    update(user, id, dto) {
        return this.lrService.update(user.organizationId, id, dto);
    }
    remove(user, id) {
        return this.lrService.remove(user.organizationId, id);
    }
};
exports.LrController = LrController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, roles_decorator_1.Roles)(enums_1.RoleName.ADMIN, enums_1.RoleName.TRANSPORT_MANAGER, enums_1.RoleName.DISPATCHER),
    (0, swagger_1.ApiOperation)({ summary: 'Generate a new Lorry Receipt (LR)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Lorry Receipt generated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request / invalid shipment ID' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'LR number already exists in organization' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_lr_dto_1.CreateLrDto]),
    __metadata("design:returntype", void 0)
], LrController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.RoleName.ADMIN, enums_1.RoleName.TRANSPORT_MANAGER, enums_1.RoleName.DISPATCHER, enums_1.RoleName.ACCOUNTS, enums_1.RoleName.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'List Lorry Receipts with search & pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated list of Lorry Receipts' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_lr_dto_1.QueryLrDto]),
    __metadata("design:returntype", void 0)
], LrController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.RoleName.ADMIN, enums_1.RoleName.TRANSPORT_MANAGER, enums_1.RoleName.DISPATCHER, enums_1.RoleName.ACCOUNTS, enums_1.RoleName.VIEWER),
    (0, swagger_1.ApiOperation)({ summary: 'Get Lorry Receipt details by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lorry Receipt details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Lorry Receipt not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], LrController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.RoleName.ADMIN, enums_1.RoleName.TRANSPORT_MANAGER, enums_1.RoleName.ACCOUNTS),
    (0, swagger_1.ApiOperation)({ summary: 'Update Lorry Receipt details & freight charges' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lorry Receipt updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Lorry Receipt not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_lr_dto_1.UpdateLrDto]),
    __metadata("design:returntype", void 0)
], LrController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, roles_decorator_1.Roles)(enums_1.RoleName.ADMIN, enums_1.RoleName.TRANSPORT_MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete Lorry Receipt' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lorry Receipt deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Lorry Receipt not found' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], LrController.prototype, "remove", null);
exports.LrController = LrController = __decorate([
    (0, swagger_1.ApiTags)('LR (Lorry Receipts)'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('lr'),
    __metadata("design:paramtypes", [lr_service_1.LrService])
], LrController);
//# sourceMappingURL=lr.controller.js.map