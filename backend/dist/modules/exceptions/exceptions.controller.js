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
exports.ExceptionsController = void 0;
const common_1 = require("@nestjs/common");
const exceptions_service_1 = require("./exceptions.service");
const create_exceptions_dto_1 = require("./dto/create-exceptions.dto");
const query_exceptions_dto_1 = require("./dto/query-exceptions.dto");
let ExceptionsController = class ExceptionsController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(req, dto) {
        return this.service.create(req.user.organizationId, dto);
    }
    findAll(req, query) {
        return this.service.findAll(req.user.organizationId, query);
    }
    findOne(req, id) {
        return this.service.findOne(req.user.organizationId, id);
    }
};
exports.ExceptionsController = ExceptionsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_exceptions_dto_1.CreateExceptionRecordDto]),
    __metadata("design:returntype", void 0)
], ExceptionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_exceptions_dto_1.QueryExceptionRecordDto]),
    __metadata("design:returntype", void 0)
], ExceptionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ExceptionsController.prototype, "findOne", null);
exports.ExceptionsController = ExceptionsController = __decorate([
    (0, common_1.Controller)('exceptions'),
    __metadata("design:paramtypes", [exceptions_service_1.ExceptionsService])
], ExceptionsController);
//# sourceMappingURL=exceptions.controller.js.map