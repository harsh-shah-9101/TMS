import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { UpdateTripStatusDto } from './dto/update-trip-status.dto';
import { QueryTripDto } from './dto/query-trip.dto';
import { CreateTripStopDto } from './dto/create-trip-stop.dto';
import { UpdateTripStopStatusDto } from './dto/update-trip-stop-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';
import { RoleName } from '@prisma/client';

@ApiTags('Trips')
@ApiBearerAuth('JWT-auth')
@Controller('trips')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.TRANSPORT_MANAGER, RoleName.DISPATCHER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new trip' })
  create(@CurrentUser() user: UserPayload, @Body() dto: CreateTripDto) {
    return this.tripsService.create(user.organizationId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List trips with filtering and pagination' })
  findAll(@CurrentUser() user: UserPayload, @Query() query: QueryTripDto) {
    return this.tripsService.findAll(user.organizationId, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get trip details by ID' })
  findOne(@CurrentUser() user: UserPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.tripsService.findOne(user.organizationId, id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.TRANSPORT_MANAGER, RoleName.DISPATCHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update trip details' })
  update(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTripDto,
  ) {
    return this.tripsService.update(user.organizationId, id, dto);
  }

  @Patch(':id/status')
  @Roles(
    RoleName.ADMIN,
    RoleName.SUPER_ADMIN,
    RoleName.TRANSPORT_MANAGER,
    RoleName.DISPATCHER,
    RoleName.DRIVER,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update trip status' })
  updateStatus(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTripStatusDto,
  ) {
    return this.tripsService.updateStatus(user.organizationId, id, dto);
  }

  @Post(':id/stops')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.TRANSPORT_MANAGER, RoleName.DISPATCHER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a stop to trip' })
  addStop(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateTripStopDto,
  ) {
    return this.tripsService.addStop(user.organizationId, id, dto);
  }

  @Patch(':id/stops/:stopId/status')
  @Roles(
    RoleName.ADMIN,
    RoleName.SUPER_ADMIN,
    RoleName.TRANSPORT_MANAGER,
    RoleName.DISPATCHER,
    RoleName.DRIVER,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update stop status' })
  updateStopStatus(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('stopId', ParseUUIDPipe) stopId: string,
    @Body() dto: UpdateTripStopStatusDto,
  ) {
    return this.tripsService.updateStopStatus(user.organizationId, id, stopId, dto);
  }

  @Delete(':id/stops/:stopId')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.TRANSPORT_MANAGER, RoleName.DISPATCHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove stop from trip' })
  removeStop(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('stopId', ParseUUIDPipe) stopId: string,
  ) {
    return this.tripsService.removeStop(user.organizationId, id, stopId);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.TRANSPORT_MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete trip' })
  remove(@CurrentUser() user: UserPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.tripsService.remove(user.organizationId, id);
  }
}
