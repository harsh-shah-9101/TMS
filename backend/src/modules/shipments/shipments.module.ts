import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import { Shipment } from './models/shipment.model';
import { ShipmentItem } from './models/shipment-item.model';

import { Customer } from '../customers/models/customer.model';

@Module({
  imports: [SequelizeModule.forFeature([Shipment, ShipmentItem, Customer])],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
  exports: [ShipmentsService],
})
export class ShipmentsModule {}
