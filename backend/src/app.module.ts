import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import configuration from './config/configuration';
import { SequelizeModule } from '@nestjs/sequelize';
import { RolesModule } from './modules/roles/roles.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './health/health.module';
import { VehicleTypesModule } from './modules/vehicle-types/vehicle-types.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { CustomersModule } from './modules/customers/customers.module';
import { CarriersModule } from './modules/carriers/carriers.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { LrModule } from './modules/lr/lr.module';
import { RoutesModule } from './modules/routes/routes.module';
import { TripsModule } from './modules/trips/trips.module';
import { DispatchModule } from './modules/dispatch/dispatch.module';

import { VehicleLocationsModule } from './modules/vehicle-locations/vehicle-locations.module';
import { TrackingEventsModule } from './modules/tracking-events/tracking-events.module';
import { FuelModule } from './modules/fuel/fuel.module';
import { DriverAdvancesModule } from './modules/driver-advances/driver-advances.module';
import { TyresModule } from './modules/tyres/tyres.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { PodModule } from './modules/pod/pod.module';
import { BillingModule } from './modules/billing/billing.module';
import { PurchaseBillsModule } from './modules/purchase-bills/purchase-bills.module';
import { SettlementsModule } from './modules/settlements/settlements.module';
import { ExceptionsModule } from './modules/exceptions/exceptions.module';
// import { NotificationsModule } from './modules/notifications/notifications.module';
// import { BullModule } from '@nestjs/bullmq';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      uri: process.env.DATABASE_URL,
      autoLoadModels: true,
      synchronize: true, // Enable sync to auto-create tables
      logging: false,
    }),
    // BullModule.forRoot({
    //   connection: {
    //     host: process.env.REDIS_HOST || 'localhost',
    //     port: parseInt(process.env.REDIS_PORT || '6379', 10),
    //   },
    // }),
    RolesModule,
    AuthModule,
    HealthModule,
    VehicleTypesModule,
    VehiclesModule,
    DriversModule,
    CustomersModule,
    CarriersModule,
    ShipmentsModule,
    LrModule,
    RoutesModule,
    TripsModule,
    DispatchModule,
    VehicleLocationsModule,
    TrackingEventsModule,
    FuelModule,
    DriverAdvancesModule,
    TyresModule,
    MaintenanceModule,
    ComplianceModule,
    PodModule,
    BillingModule,
    PurchaseBillsModule,
    SettlementsModule,
    ExceptionsModule,
    // NotificationsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
