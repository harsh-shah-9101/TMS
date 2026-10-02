import { Controller, Get, Post, Body, Query, Param, Req } from '@nestjs/common';
import { DriverAdvancesService } from './driver-advances.service';
import { CreateDriverAdvanceDto } from './dto/create-driver-advances.dto';
import { QueryDriverAdvanceDto } from './dto/query-driver-advances.dto';

@Controller('driver-advances')
export class DriverAdvancesController {
  constructor(private readonly service: DriverAdvancesService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateDriverAdvanceDto) {
    return this.service.create(req.user.organizationId, dto);
  }

  @Get()
  findAll(@Req() req: any, @Query() query: QueryDriverAdvanceDto) {
    return this.service.findAll(req.user.organizationId, query);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.service.findOne(req.user.organizationId, id);
  }
}
