import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TrackingEventsService } from './tracking-events.service';
import { TrackingEventsController } from './tracking-events.controller';
import { TrackingEvent } from './models/tracking-event.model';
import { Trip } from '../trips/models/trip.model';
import { Vehicle } from '../vehicles/models/vehicle.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      TrackingEvent,
      Trip,
      Vehicle,
    ]),
  ],
  controllers: [TrackingEventsController],
  providers: [TrackingEventsService],
  exports: [TrackingEventsService],
})
export class TrackingEventsModule {}
