import { Controller, Get, Post, Body, Query, Param, Req } from '@nestjs/common';
import { SettlementsService } from './settlements.service';
import { CreateSettlementDto } from './dto/create-settlements.dto';
import { QuerySettlementDto } from './dto/query-settlements.dto';

@Controller('settlements')
export class SettlementsController {
  constructor(private readonly service: SettlementsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateSettlementDto) {
    return this.service.create(req.user.organizationId, dto);
  }

  @Get()
  findAll(@Req() req: any, @Query() query: QuerySettlementDto) {
    return this.service.findAll(req.user.organizationId, query);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.service.findOne(req.user.organizationId, id);
  }
}
