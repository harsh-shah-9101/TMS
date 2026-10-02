import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DriverAdvancesService } from './driver-advances.service';
import { DriverAdvancesController } from './driver-advances.controller';
import { DriverAdvance } from './models/driver-advances.model';

@Module({
  imports: [SequelizeModule.forFeature([DriverAdvance])],
  controllers: [DriverAdvancesController],
  providers: [DriverAdvancesService],
  exports: [DriverAdvancesService],
})
export class DriverAdvancesModule {}
