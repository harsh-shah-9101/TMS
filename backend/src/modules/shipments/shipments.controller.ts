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
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { QueryShipmentDto } from './dto/query-shipment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';
import { RoleName } from '@prisma/client';

@ApiTags('Shipments & Bookings')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleName.ADMIN, RoleName.TRANSPORT_MANAGER, RoleName.DISPATCHER)
  @ApiOperation({ summary: 'Create a new freight shipment / booking' })
  @ApiResponse({ status: 201, description: 'Shipment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request / invalid customer' })
  @ApiResponse({ status: 409, description: 'Booking number already exists in organization' })
  create(
    @CurrentUser() user: UserPayload,
    @Body() dto: CreateShipmentDto,
  ) {
    return this.shipmentsService.create(user.organizationId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(
    RoleName.ADMIN,
    RoleName.TRANSPORT_MANAGER,
    RoleName.DISPATCHER,
    RoleName.FLEET_MANAGER,
    RoleName.ACCOUNTS,
    RoleName.VIEWER,
  )
  @ApiOperation({ summary: 'List shipments with search, status filter, and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of shipments' })
  findAll(
    @CurrentUser() user: UserPayload,
    @Query() query: QueryShipmentDto,
  ) {
    return this.shipmentsService.findAll(user.organizationId, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(
    RoleName.ADMIN,
    RoleName.TRANSPORT_MANAGER,
    RoleName.DISPATCHER,
    RoleName.FLEET_MANAGER,
    RoleName.ACCOUNTS,
    RoleName.VIEWER,
  )
  @ApiOperation({ summary: 'Get shipment details by ID' })
  @ApiResponse({ status: 200, description: 'Shipment details' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  findOne(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.shipmentsService.findOne(user.organizationId, id);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.TRANSPORT_MANAGER, RoleName.DISPATCHER)
  @ApiOperation({ summary: 'Update shipment status transition (Strict workflow rules)' })
  @ApiResponse({ status: 200, description: 'Shipment status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  updateStatus(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateShipmentStatusDto,
  ) {
    return this.shipmentsService.updateStatus(user.organizationId, id, dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.TRANSPORT_MANAGER, RoleName.DISPATCHER)
  @ApiOperation({ summary: 'Update shipment booking details' })
  @ApiResponse({ status: 200, description: 'Shipment updated successfully' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  update(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateShipmentDto,
  ) {
    return this.shipmentsService.update(user.organizationId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.TRANSPORT_MANAGER)
  @ApiOperation({ summary: 'Soft delete shipment' })
  @ApiResponse({ status: 200, description: 'Shipment deleted successfully' })
  @ApiResponse({ status: 404, description: 'Shipment not found' })
  remove(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.shipmentsService.remove(user.organizationId, id);
  }
}
