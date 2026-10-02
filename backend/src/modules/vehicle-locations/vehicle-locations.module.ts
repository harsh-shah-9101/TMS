import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { VehicleLocationsService } from './vehicle-locations.service';
import { VehicleLocationsController } from './vehicle-locations.controller';
import { VehicleLocation } from './models/vehicle-location.model';
import { Vehicle } from '../vehicles/models/vehicle.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      VehicleLocation,
      Vehicle,
    ]),
  ],
  controllers: [VehicleLocationsController],
  providers: [VehicleLocationsService],
  exports: [VehicleLocationsService],
})
export class VehicleLocationsModule {}
