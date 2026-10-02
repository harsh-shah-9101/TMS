import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { Route } from './models/route.model';

@Module({
  imports: [SequelizeModule.forFeature([Route])],
  controllers: [RoutesController],
  providers: [RoutesService],
  exports: [RoutesService],
})
export class RoutesModule {}
