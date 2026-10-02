"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TyresModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const tyres_service_1 = require("./tyres.service");
const tyres_controller_1 = require("./tyres.controller");
const tyres_model_1 = require("./models/tyres.model");
let TyresModule = class TyresModule {
};
exports.TyresModule = TyresModule;
exports.TyresModule = TyresModule = __decorate([
    (0, common_1.Module)({
        imports: [sequelize_1.SequelizeModule.forFeature([tyres_model_1.Tyre])],
        controllers: [tyres_controller_1.TyresController],
        providers: [tyres_service_1.TyresService],
        exports: [tyres_service_1.TyresService],
    })
], TyresModule);
//# sourceMappingURL=tyres.module.js.map