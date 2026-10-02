import { Controller, Get, Post, Body, Query, Param, Req } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceRecordDto } from './dto/create-maintenance.dto';
import { QueryMaintenanceRecordDto } from './dto/query-maintenance.dto';

@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly service: MaintenanceService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateMaintenanceRecordDto) {
    return this.service.create(req.user.organizationId, dto);
  }

  @Get()
  findAll(@Req() req: any, @Query() query: QueryMaintenanceRecordDto) {
    return this.service.findAll(req.user.organizationId, query);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.service.findOne(req.user.organizationId, id);
  }
}
