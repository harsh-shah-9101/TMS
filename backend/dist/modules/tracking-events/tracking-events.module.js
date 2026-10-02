"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingEventsModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const tracking_events_service_1 = require("./tracking-events.service");
const tracking_events_controller_1 = require("./tracking-events.controller");
const tracking_event_model_1 = require("./models/tracking-event.model");
const trip_model_1 = require("../trips/models/trip.model");
const vehicle_model_1 = require("../vehicles/models/vehicle.model");
let TrackingEventsModule = class TrackingEventsModule {
};
exports.TrackingEventsModule = TrackingEventsModule;
exports.TrackingEventsModule = TrackingEventsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forFeature([
                tracking_event_model_1.TrackingEvent,
                trip_model_1.Trip,
                vehicle_model_1.Vehicle,
            ]),
        ],
        controllers: [tracking_events_controller_1.TrackingEventsController],
        providers: [tracking_events_service_1.TrackingEventsService],
        exports: [tracking_events_service_1.TrackingEventsService],
    })
], TrackingEventsModule);
//# sourceMappingURL=tracking-events.module.js.map