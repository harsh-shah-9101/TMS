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
exports.PurchaseBillsController = void 0;
const common_1 = require("@nestjs/common");
const purchase_bills_service_1 = require("./purchase-bills.service");
const create_purchase_bills_dto_1 = require("./dto/create-purchase-bills.dto");
const query_purchase_bills_dto_1 = require("./dto/query-purchase-bills.dto");
let PurchaseBillsController = class PurchaseBillsController {
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
exports.PurchaseBillsController = PurchaseBillsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_purchase_bills_dto_1.CreatePurchaseBillDto]),
    __metadata("design:returntype", void 0)
], PurchaseBillsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_purchase_bills_dto_1.QueryPurchaseBillDto]),
    __metadata("design:returntype", void 0)
], PurchaseBillsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PurchaseBillsController.prototype, "findOne", null);
exports.PurchaseBillsController = PurchaseBillsController = __decorate([
    (0, common_1.Controller)('purchase-bills'),
    __metadata("design:paramtypes", [purchase_bills_service_1.PurchaseBillsService])
], PurchaseBillsController);
//# sourceMappingURL=purchase-bills.controller.js.map