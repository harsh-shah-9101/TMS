"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverAdvancesModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const driver_advances_service_1 = require("./driver-advances.service");
const driver_advances_controller_1 = require("./driver-advances.controller");
const driver_advances_model_1 = require("./models/driver-advances.model");
let DriverAdvancesModule = class DriverAdvancesModule {
};
exports.DriverAdvancesModule = DriverAdvancesModule;
exports.DriverAdvancesModule = DriverAdvancesModule = __decorate([
    (0, common_1.Module)({
        imports: [sequelize_1.SequelizeModule.forFeature([driver_advances_model_1.DriverAdvance])],
        controllers: [driver_advances_controller_1.DriverAdvancesController],
        providers: [driver_advances_service_1.DriverAdvancesService],
        exports: [driver_advances_service_1.DriverAdvancesService],
    })
], DriverAdvancesModule);
//# sourceMappingURL=driver-advances.module.js.map