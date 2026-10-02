import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DispatchService } from './dispatch.service';
import { DispatchController } from './dispatch.controller';
import { Dispatch } from './models/dispatch.model';
import { Trip } from '../trips/models/trip.model';
import { Vehicle } from '../vehicles/models/vehicle.model';
import { Driver } from '../drivers/models/driver.model';
import { Route } from '../routes/models/route.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Dispatch,
      Trip,
      Vehicle,
      Driver,
      Route,
    ]),
  ],
  controllers: [DispatchController],
  providers: [DispatchService],
  exports: [DispatchService],
})
export class DispatchModule {}
