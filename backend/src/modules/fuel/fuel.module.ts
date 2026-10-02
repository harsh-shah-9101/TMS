import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FuelService } from './fuel.service';
import { FuelController } from './fuel.controller';
import { FuelLog } from './models/fuel.model';

@Module({
  imports: [SequelizeModule.forFeature([FuelLog])],
  controllers: [FuelController],
  providers: [FuelService],
  exports: [FuelService],
})
export class FuelModule {}
