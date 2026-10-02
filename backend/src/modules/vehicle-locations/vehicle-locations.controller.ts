import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { VehicleLocationsService } from './vehicle-locations.service';
import { CreateVehicleLocationDto } from './dto/create-vehicle-location.dto';
import { QueryVehicleLocationDto } from './dto/query-vehicle-location.dto';

@Controller('vehicle-locations')
export class VehicleLocationsController {
  constructor(private readonly locationsService: VehicleLocationsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateVehicleLocationDto) {
    const organizationId = req.user.organizationId;
    return this.locationsService.create(organizationId, dto);
  }

  @Get()
  findAll(@Req() req: any, @Query() query: QueryVehicleLocationDto) {
    const organizationId = req.user.organizationId;
    return this.locationsService.findAll(organizationId, query);
  }

  @Get('latest/:vehicleId')
  getLatestLocation(@Req() req: any, @Param('vehicleId') vehicleId: string) {
    const organizationId = req.user.organizationId;
    return this.locationsService.getLatestLocation(organizationId, vehicleId);
  }
}
