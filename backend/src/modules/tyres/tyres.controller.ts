import { Controller, Get, Post, Body, Query, Param, Req } from '@nestjs/common';
import { TyresService } from './tyres.service';
import { CreateTyreDto } from './dto/create-tyres.dto';
import { QueryTyreDto } from './dto/query-tyres.dto';

@Controller('tyres')
export class TyresController {
  constructor(private readonly service: TyresService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateTyreDto) {
    return this.service.create(req.user.organizationId, dto);
  }

  @Get()
  findAll(@Req() req: any, @Query() query: QueryTyreDto) {
    return this.service.findAll(req.user.organizationId, query);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.service.findOne(req.user.organizationId, id);
  }
}
