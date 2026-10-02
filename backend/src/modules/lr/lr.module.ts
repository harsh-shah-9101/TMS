import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LrService } from './lr.service';
import { LrController } from './lr.controller';
import { LorryReceipt } from './models/lr.model';
import { Shipment } from '../shipments/models/shipment.model';

@Module({
  imports: [SequelizeModule.forFeature([LorryReceipt, Shipment])],
  controllers: [LrController],
  providers: [LrService],
  exports: [LrService],
})
export class LrModule {}
