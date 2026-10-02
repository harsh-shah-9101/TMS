"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseBillsModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const purchase_bills_service_1 = require("./purchase-bills.service");
const purchase_bills_controller_1 = require("./purchase-bills.controller");
const purchase_bills_model_1 = require("./models/purchase-bills.model");
let PurchaseBillsModule = class PurchaseBillsModule {
};
exports.PurchaseBillsModule = PurchaseBillsModule;
exports.PurchaseBillsModule = PurchaseBillsModule = __decorate([
    (0, common_1.Module)({
        imports: [sequelize_1.SequelizeModule.forFeature([purchase_bills_model_1.PurchaseBill])],
        controllers: [purchase_bills_controller_1.PurchaseBillsController],
        providers: [purchase_bills_service_1.PurchaseBillsService],
        exports: [purchase_bills_service_1.PurchaseBillsService],
    })
], PurchaseBillsModule);
//# sourceMappingURL=purchase-bills.module.js.map