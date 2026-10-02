import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PurchaseBillsService } from './purchase-bills.service';
import { PurchaseBillsController } from './purchase-bills.controller';
import { PurchaseBill } from './models/purchase-bills.model';

@Module({
  imports: [SequelizeModule.forFeature([PurchaseBill])],
  controllers: [PurchaseBillsController],
  providers: [PurchaseBillsService],
  exports: [PurchaseBillsService],
})
export class PurchaseBillsModule {}
