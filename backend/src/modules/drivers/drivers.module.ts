import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { Driver } from './models/driver.model';
import { User } from '../users/models/user.model';

@Module({
  imports: [SequelizeModule.forFeature([Driver, User])],
  controllers: [DriversController],
  providers: [DriversService],
  exports: [DriversService],
})
export class DriversModule {}
