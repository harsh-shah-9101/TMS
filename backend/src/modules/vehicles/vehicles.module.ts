import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { Vehicle } from './models/vehicle.model';
import { VehicleType } from '../vehicle-types/models/vehicle-types.model';

@Module({
  imports: [SequelizeModule.forFeature([Vehicle, VehicleType])],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
