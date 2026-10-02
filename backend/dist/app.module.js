"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const configuration_1 = __importDefault(require("./config/configuration"));
const sequelize_1 = require("@nestjs/sequelize");
const roles_module_1 = require("./modules/roles/roles.module");
const auth_module_1 = require("./modules/auth/auth.module");
const health_module_1 = require("./health/health.module");
const vehicle_types_module_1 = require("./modules/vehicle-types/vehicle-types.module");
const vehicles_module_1 = require("./modules/vehicles/vehicles.module");
const drivers_module_1 = require("./modules/drivers/drivers.module");
const customers_module_1 = require("./modules/customers/customers.module");
const carriers_module_1 = require("./modules/carriers/carriers.module");
const shipments_module_1 = require("./modules/shipments/shipments.module");
const lr_module_1 = require("./modules/lr/lr.module");
const routes_module_1 = require("./modules/routes/routes.module");
const trips_module_1 = require("./modules/trips/trips.module");
const dispatch_module_1 = require("./modules/dispatch/dispatch.module");
const vehicle_locations_module_1 = require("./modules/vehicle-locations/vehicle-locations.module");
const tracking_events_module_1 = require("./modules/tracking-events/tracking-events.module");
const fuel_module_1 = require("./modules/fuel/fuel.module");
const driver_advances_module_1 = require("./modules/driver-advances/driver-advances.module");
const tyres_module_1 = require("./modules/tyres/tyres.module");
const maintenance_module_1 = require("./modules/maintenance/maintenance.module");
const compliance_module_1 = require("./modules/compliance/compliance.module");
const pod_module_1 = require("./modules/pod/pod.module");
const billing_module_1 = require("./modules/billing/billing.module");
const purchase_bills_module_1 = require("./modules/purchase-bills/purchase-bills.module");
const settlements_module_1 = require("./modules/settlements/settlements.module");
const exceptions_module_1 = require("./modules/exceptions/exceptions.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
            }),
            sequelize_1.SequelizeModule.forRoot({
                dialect: 'postgres',
                uri: process.env.DATABASE_URL,
                autoLoadModels: true,
                synchronize: true,
                logging: false,
            }),
            roles_module_1.RolesModule,
            auth_module_1.AuthModule,
            health_module_1.HealthModule,
            vehicle_types_module_1.VehicleTypesModule,
            vehicles_module_1.VehiclesModule,
            drivers_module_1.DriversModule,
            customers_module_1.CustomersModule,
            carriers_module_1.CarriersModule,
            shipments_module_1.ShipmentsModule,
            lr_module_1.LrModule,
            routes_module_1.RoutesModule,
            trips_module_1.TripsModule,
            dispatch_module_1.DispatchModule,
            vehicle_locations_module_1.VehicleLocationsModule,
            tracking_events_module_1.TrackingEventsModule,
            fuel_module_1.FuelModule,
            driver_advances_module_1.DriverAdvancesModule,
            tyres_module_1.TyresModule,
            maintenance_module_1.MaintenanceModule,
            compliance_module_1.ComplianceModule,
            pod_module_1.PodModule,
            billing_module_1.BillingModule,
            purchase_bills_module_1.PurchaseBillsModule,
            settlements_module_1.SettlementsModule,
            exceptions_module_1.ExceptionsModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
            {
                provide: core_1.APP_FILTER,
                useClass: http_exception_filter_1.HttpExceptionFilter,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: logging_interceptor_1.LoggingInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map