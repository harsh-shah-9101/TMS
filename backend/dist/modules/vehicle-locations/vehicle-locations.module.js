"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleLocationsModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const vehicle_locations_service_1 = require("./vehicle-locations.service");
const vehicle_locations_controller_1 = require("./vehicle-locations.controller");
const vehicle_location_model_1 = require("./models/vehicle-location.model");
const vehicle_model_1 = require("../vehicles/models/vehicle.model");
let VehicleLocationsModule = class VehicleLocationsModule {
};
exports.VehicleLocationsModule = VehicleLocationsModule;
exports.VehicleLocationsModule = VehicleLocationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forFeature([
                vehicle_location_model_1.VehicleLocation,
                vehicle_model_1.Vehicle,
            ]),
        ],
        controllers: [vehicle_locations_controller_1.VehicleLocationsController],
        providers: [vehicle_locations_service_1.VehicleLocationsService],
        exports: [vehicle_locations_service_1.VehicleLocationsService],
    })
], VehicleLocationsModule);
//# sourceMappingURL=vehicle-locations.module.js.map