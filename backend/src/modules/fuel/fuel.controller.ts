import { Controller, Get, Post, Body, Query, Param, Req } from '@nestjs/common';
import { FuelService } from './fuel.service';
import { CreateFuelLogDto } from './dto/create-fuel.dto';
import { QueryFuelLogDto } from './dto/query-fuel.dto';

@Controller('fuel')
export class FuelController {
  constructor(private readonly service: FuelService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateFuelLogDto) {
    return this.service.create(req.user.organizationId, dto);
  }

  @Get()
  findAll(@Req() req: any, @Query() query: QueryFuelLogDto) {
    return this.service.findAll(req.user.organizationId, query);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.service.findOne(req.user.organizationId, id);
  }
}
