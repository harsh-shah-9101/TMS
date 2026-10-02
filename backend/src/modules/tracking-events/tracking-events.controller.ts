import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TrackingEventsService } from './tracking-events.service';
import { CreateTrackingEventDto } from './dto/create-tracking-event.dto';
import { QueryTrackingEventDto } from './dto/query-tracking-event.dto';

@Controller('tracking-events')
export class TrackingEventsController {
  constructor(private readonly eventsService: TrackingEventsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateTrackingEventDto) {
    const organizationId = req.user.organizationId;
    return this.eventsService.create(organizationId, dto);
  }

  @Get()
  findAll(@Req() req: any, @Query() query: QueryTrackingEventDto) {
    const organizationId = req.user.organizationId;
    return this.eventsService.findAll(organizationId, query);
  }
}
