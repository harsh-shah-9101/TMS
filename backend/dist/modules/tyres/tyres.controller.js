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
exports.TyresController = void 0;
const common_1 = require("@nestjs/common");
const tyres_service_1 = require("./tyres.service");
const create_tyres_dto_1 = require("./dto/create-tyres.dto");
const query_tyres_dto_1 = require("./dto/query-tyres.dto");
let TyresController = class TyresController {
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
exports.TyresController = TyresController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_tyres_dto_1.CreateTyreDto]),
    __metadata("design:returntype", void 0)
], TyresController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_tyres_dto_1.QueryTyreDto]),
    __metadata("design:returntype", void 0)
], TyresController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TyresController.prototype, "findOne", null);
exports.TyresController = TyresController = __decorate([
    (0, common_1.Controller)('tyres'),
    __metadata("design:paramtypes", [tyres_service_1.TyresService])
], TyresController);
//# sourceMappingURL=tyres.controller.js.map