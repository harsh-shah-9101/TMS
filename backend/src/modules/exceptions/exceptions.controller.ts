import { Controller, Get, Post, Body, Query, Param, Req } from '@nestjs/common';
import { ExceptionsService } from './exceptions.service';
import { CreateExceptionRecordDto } from './dto/create-exceptions.dto';
import { QueryExceptionRecordDto } from './dto/query-exceptions.dto';

@Controller('exceptions')
export class ExceptionsController {
  constructor(private readonly service: ExceptionsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateExceptionRecordDto) {
    return this.service.create(req.user.organizationId, dto);
  }

  @Get()
  findAll(@Req() req: any, @Query() query: QueryExceptionRecordDto) {
    return this.service.findAll(req.user.organizationId, query);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.service.findOne(req.user.organizationId, id);
  }
}
