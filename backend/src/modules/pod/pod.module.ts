import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PodService } from './pod.service';
import { PodController } from './pod.controller';
import { Pod } from './models/pod.model';

@Module({
  imports: [SequelizeModule.forFeature([Pod])],
  controllers: [PodController],
  providers: [PodService],
  exports: [PodService],
})
export class PodModule {}
