"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PodModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const pod_service_1 = require("./pod.service");
const pod_controller_1 = require("./pod.controller");
const pod_model_1 = require("./models/pod.model");
let PodModule = class PodModule {
};
exports.PodModule = PodModule;
exports.PodModule = PodModule = __decorate([
    (0, common_1.Module)({
        imports: [sequelize_1.SequelizeModule.forFeature([pod_model_1.Pod])],
        controllers: [pod_controller_1.PodController],
        providers: [pod_service_1.PodService],
        exports: [pod_service_1.PodService],
    })
], PodModule);
//# sourceMappingURL=pod.module.js.map