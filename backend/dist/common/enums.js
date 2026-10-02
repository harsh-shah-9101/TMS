"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarrierStatus = exports.DispatchStatus = exports.CustomerType = exports.CustomerStatus = exports.LRStatus = exports.FreightTerm = exports.RouteStatus = exports.ShipmentStatus = exports.StopType = exports.StopStatus = exports.TripStatus = exports.DriverStatus = exports.VehicleTypeStatus = exports.FuelType = exports.VehicleStatus = exports.OwnershipType = exports.RoleName = void 0;
var RoleName;
(function (RoleName) {
    RoleName["SUPER_ADMIN"] = "SUPER_ADMIN";
    RoleName["ADMIN"] = "ADMIN";
    RoleName["TRANSPORT_MANAGER"] = "TRANSPORT_MANAGER";
    RoleName["DISPATCHER"] = "DISPATCHER";
    RoleName["FLEET_MANAGER"] = "FLEET_MANAGER";
    RoleName["ACCOUNTS"] = "ACCOUNTS";
    RoleName["DRIVER"] = "DRIVER";
    RoleName["VIEWER"] = "VIEWER";
})(RoleName || (exports.RoleName = RoleName = {}));
var OwnershipType;
(function (OwnershipType) {
    OwnershipType["OWNED"] = "OWNED";
    OwnershipType["LEASED"] = "LEASED";
    OwnershipType["MARKET"] = "MARKET";
})(OwnershipType || (exports.OwnershipType = OwnershipType = {}));
var VehicleStatus;
(function (VehicleStatus) {
    VehicleStatus["AVAILABLE"] = "AVAILABLE";
    VehicleStatus["IN_TRANSIT"] = "IN_TRANSIT";
    VehicleStatus["MAINTENANCE"] = "MAINTENANCE";
    VehicleStatus["OUT_OF_SERVICE"] = "OUT_OF_SERVICE";
    VehicleStatus["ASSIGNED"] = "ASSIGNED";
})(VehicleStatus || (exports.VehicleStatus = VehicleStatus = {}));
var FuelType;
(function (FuelType) {
    FuelType["DIESEL"] = "DIESEL";
    FuelType["PETROL"] = "PETROL";
    FuelType["CNG"] = "CNG";
    FuelType["ELECTRIC"] = "ELECTRIC";
    FuelType["OTHER"] = "OTHER";
})(FuelType || (exports.FuelType = FuelType = {}));
var VehicleTypeStatus;
(function (VehicleTypeStatus) {
    VehicleTypeStatus["ACTIVE"] = "ACTIVE";
    VehicleTypeStatus["INACTIVE"] = "INACTIVE";
})(VehicleTypeStatus || (exports.VehicleTypeStatus = VehicleTypeStatus = {}));
var DriverStatus;
(function (DriverStatus) {
    DriverStatus["AVAILABLE"] = "AVAILABLE";
    DriverStatus["ON_TRIP"] = "ON_TRIP";
    DriverStatus["ON_LEAVE"] = "ON_LEAVE";
    DriverStatus["INACTIVE"] = "INACTIVE";
    DriverStatus["ASSIGNED"] = "ASSIGNED";
})(DriverStatus || (exports.DriverStatus = DriverStatus = {}));
var TripStatus;
(function (TripStatus) {
    TripStatus["DRAFT"] = "DRAFT";
    TripStatus["PLANNED"] = "PLANNED";
    TripStatus["DISPATCHED"] = "DISPATCHED";
    TripStatus["IN_TRANSIT"] = "IN_TRANSIT";
    TripStatus["COMPLETED"] = "COMPLETED";
    TripStatus["CANCELLED"] = "CANCELLED";
    TripStatus["ASSIGNED"] = "ASSIGNED";
    TripStatus["PAUSED"] = "PAUSED";
})(TripStatus || (exports.TripStatus = TripStatus = {}));
var StopStatus;
(function (StopStatus) {
    StopStatus["PENDING"] = "PENDING";
    StopStatus["ARRIVED"] = "ARRIVED";
    StopStatus["DEPARTED"] = "DEPARTED";
    StopStatus["SKIPPED"] = "SKIPPED";
})(StopStatus || (exports.StopStatus = StopStatus = {}));
var StopType;
(function (StopType) {
    StopType["PICKUP"] = "PICKUP";
    StopType["DELIVERY"] = "DELIVERY";
    StopType["REST"] = "REST";
    StopType["FUEL"] = "FUEL";
    StopType["WEIGH"] = "WEIGH";
    StopType["OTHER"] = "OTHER";
})(StopType || (exports.StopType = StopType = {}));
var ShipmentStatus;
(function (ShipmentStatus) {
    ShipmentStatus["DRAFT"] = "DRAFT";
    ShipmentStatus["BOOKED"] = "BOOKED";
    ShipmentStatus["IN_TRANSIT"] = "IN_TRANSIT";
    ShipmentStatus["DELIVERED"] = "DELIVERED";
    ShipmentStatus["CANCELLED"] = "CANCELLED";
    ShipmentStatus["CREATED"] = "CREATED";
    ShipmentStatus["VALIDATED"] = "VALIDATED";
    ShipmentStatus["PLANNED"] = "PLANNED";
    ShipmentStatus["ASSIGNED"] = "ASSIGNED";
})(ShipmentStatus || (exports.ShipmentStatus = ShipmentStatus = {}));
var RouteStatus;
(function (RouteStatus) {
    RouteStatus["ACTIVE"] = "ACTIVE";
    RouteStatus["INACTIVE"] = "INACTIVE";
})(RouteStatus || (exports.RouteStatus = RouteStatus = {}));
var FreightTerm;
(function (FreightTerm) {
    FreightTerm["PREPAID"] = "PREPAID";
    FreightTerm["TO_PAY"] = "TO_PAY";
    FreightTerm["TO_BE_BILLED"] = "TO_BE_BILLED";
})(FreightTerm || (exports.FreightTerm = FreightTerm = {}));
var LRStatus;
(function (LRStatus) {
    LRStatus["DRAFT"] = "DRAFT";
    LRStatus["GENERATED"] = "GENERATED";
    LRStatus["IN_TRANSIT"] = "IN_TRANSIT";
    LRStatus["DELIVERED"] = "DELIVERED";
    LRStatus["CANCELLED"] = "CANCELLED";
    LRStatus["ISSUED"] = "ISSUED";
})(LRStatus || (exports.LRStatus = LRStatus = {}));
var CustomerStatus;
(function (CustomerStatus) {
    CustomerStatus["ACTIVE"] = "ACTIVE";
    CustomerStatus["INACTIVE"] = "INACTIVE";
    CustomerStatus["SUSPENDED"] = "SUSPENDED";
})(CustomerStatus || (exports.CustomerStatus = CustomerStatus = {}));
var CustomerType;
(function (CustomerType) {
    CustomerType["REGULAR"] = "REGULAR";
    CustomerType["CORPORATE"] = "CORPORATE";
    CustomerType["INDIVIDUAL"] = "INDIVIDUAL";
    CustomerType["BOTH"] = "BOTH";
})(CustomerType || (exports.CustomerType = CustomerType = {}));
var DispatchStatus;
(function (DispatchStatus) {
    DispatchStatus["DRAFT"] = "DRAFT";
    DispatchStatus["ASSIGNED"] = "ASSIGNED";
    DispatchStatus["DISPATCHED"] = "DISPATCHED";
    DispatchStatus["COMPLETED"] = "COMPLETED";
    DispatchStatus["CANCELLED"] = "CANCELLED";
    DispatchStatus["GATE_OUT"] = "GATE_OUT";
})(DispatchStatus || (exports.DispatchStatus = DispatchStatus = {}));
var CarrierStatus;
(function (CarrierStatus) {
    CarrierStatus["ACTIVE"] = "ACTIVE";
    CarrierStatus["INACTIVE"] = "INACTIVE";
    CarrierStatus["BLACKLISTED"] = "BLACKLISTED";
})(CarrierStatus || (exports.CarrierStatus = CarrierStatus = {}));
//# sourceMappingURL=enums.js.map