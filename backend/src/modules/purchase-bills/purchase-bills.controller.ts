import { Controller, Get, Post, Body, Query, Param, Req } from '@nestjs/common';
import { PurchaseBillsService } from './purchase-bills.service';
import { CreatePurchaseBillDto } from './dto/create-purchase-bills.dto';
import { QueryPurchaseBillDto } from './dto/query-purchase-bills.dto';

@Controller('purchase-bills')
export class PurchaseBillsController {
  constructor(private readonly service: PurchaseBillsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreatePurchaseBillDto) {
    return this.service.create(req.user.organizationId, dto);
  }

  @Get()
  findAll(@Req() req: any, @Query() query: QueryPurchaseBillDto) {
    return this.service.findAll(req.user.organizationId, query);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.service.findOne(req.user.organizationId, id);
  }
}
