"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripsModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const trips_service_1 = require("./trips.service");
const trips_controller_1 = require("./trips.controller");
const trip_model_1 = require("./models/trip.model");
const trip_stop_model_1 = require("./models/trip-stop.model");
const route_model_1 = require("../routes/models/route.model");
const vehicle_model_1 = require("../vehicles/models/vehicle.model");
const driver_model_1 = require("../drivers/models/driver.model");
const carrier_model_1 = require("../carriers/models/carrier.model");
const shipment_model_1 = require("../shipments/models/shipment.model");
let TripsModule = class TripsModule {
};
exports.TripsModule = TripsModule;
exports.TripsModule = TripsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forFeature([
                trip_model_1.Trip,
                trip_stop_model_1.TripStop,
                route_model_1.Route,
                vehicle_model_1.Vehicle,
                driver_model_1.Driver,
                carrier_model_1.Carrier,
                shipment_model_1.Shipment,
            ]),
        ],
        controllers: [trips_controller_1.TripsController],
        providers: [trips_service_1.TripsService],
        exports: [trips_service_1.TripsService],
    })
], TripsModule);
//# sourceMappingURL=trips.module.js.map