import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TyresService } from './tyres.service';
import { TyresController } from './tyres.controller';
import { Tyre } from './models/tyres.model';

@Module({
  imports: [SequelizeModule.forFeature([Tyre])],
  controllers: [TyresController],
  providers: [TyresService],
  exports: [TyresService],
})
export class TyresModule {}
