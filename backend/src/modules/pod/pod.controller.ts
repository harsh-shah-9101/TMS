import { Controller, Get, Post, Body, Query, Param, Req } from '@nestjs/common';
import { PodService } from './pod.service';
import { CreatePodDto } from './dto/create-pod.dto';
import { QueryPodDto } from './dto/query-pod.dto';

@Controller('pod')
export class PodController {
  constructor(private readonly service: PodService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreatePodDto) {
    return this.service.create(req.user.organizationId, dto);
  }

  @Get()
  findAll(@Req() req: any, @Query() query: QueryPodDto) {
    return this.service.findAll(req.user.organizationId, query);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.service.findOne(req.user.organizationId, id);
  }
}
