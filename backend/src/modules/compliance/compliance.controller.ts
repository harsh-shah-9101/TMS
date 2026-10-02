import { Controller, Get, Post, Body, Query, Param, Req } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { CreateComplianceDocumentDto } from './dto/create-compliance.dto';
import { QueryComplianceDocumentDto } from './dto/query-compliance.dto';

@Controller('compliance')
export class ComplianceController {
  constructor(private readonly service: ComplianceService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateComplianceDocumentDto) {
    return this.service.create(req.user.organizationId, dto);
  }

  @Get()
  findAll(@Req() req: any, @Query() query: QueryComplianceDocumentDto) {
    return this.service.findAll(req.user.organizationId, query);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.service.findOne(req.user.organizationId, id);
  }
}
