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
exports.VehicleLocationsController = void 0;
const common_1 = require("@nestjs/common");
const vehicle_locations_service_1 = require("./vehicle-locations.service");
const create_vehicle_location_dto_1 = require("./dto/create-vehicle-location.dto");
const query_vehicle_location_dto_1 = require("./dto/query-vehicle-location.dto");
let VehicleLocationsController = class VehicleLocationsController {
    locationsService;
    constructor(locationsService) {
        this.locationsService = locationsService;
    }
    create(req, dto) {
        const organizationId = req.user.organizationId;
        return this.locationsService.create(organizationId, dto);
    }
    findAll(req, query) {
        const organizationId = req.user.organizationId;
        return this.locationsService.findAll(organizationId, query);
    }
    getLatestLocation(req, vehicleId) {
        const organizationId = req.user.organizationId;
        return this.locationsService.getLatestLocation(organizationId, vehicleId);
    }
};
exports.VehicleLocationsController = VehicleLocationsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_vehicle_location_dto_1.CreateVehicleLocationDto]),
    __metadata("design:returntype", void 0)
], VehicleLocationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_vehicle_location_dto_1.QueryVehicleLocationDto]),
    __metadata("design:returntype", void 0)
], VehicleLocationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('latest/:vehicleId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('vehicleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], VehicleLocationsController.prototype, "getLatestLocation", null);
exports.VehicleLocationsController = VehicleLocationsController = __decorate([
    (0, common_1.Controller)('vehicle-locations'),
    __metadata("design:paramtypes", [vehicle_locations_service_1.VehicleLocationsService])
], VehicleLocationsController);
//# sourceMappingURL=vehicle-locations.controller.js.map