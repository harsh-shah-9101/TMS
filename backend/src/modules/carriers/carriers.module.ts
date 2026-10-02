import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CarriersService } from './carriers.service';
import { CarriersController } from './carriers.controller';
import { Carrier } from './models/carrier.model';

@Module({
  imports: [SequelizeModule.forFeature([Carrier])],
  controllers: [CarriersController],
  providers: [CarriersService],
  exports: [CarriersService],
})
export class CarriersModule {}
