import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { Trip } from './models/trip.model';
import { TripStop } from './models/trip-stop.model';
import { Route } from '../routes/models/route.model';
import { Vehicle } from '../vehicles/models/vehicle.model';
import { Driver } from '../drivers/models/driver.model';
import { Carrier } from '../carriers/models/carrier.model';
import { Shipment } from '../shipments/models/shipment.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Trip,
      TripStop,
      Route,
      Vehicle,
      Driver,
      Carrier,
      Shipment,
    ]),
  ],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}
