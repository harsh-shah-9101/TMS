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
import { VehicleTypesService } from './vehicle-types.service';
import { CreateVehicleTypeDto } from './dto/create-vehicle-type.dto';
import { UpdateVehicleTypeDto } from './dto/update-vehicle-type.dto';
import { QueryVehicleTypeDto } from './dto/query-vehicle-type.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';
import { RoleName } from '../../common/enums';

@ApiTags('Vehicle Types')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vehicle-types')
export class VehicleTypesController {
  constructor(private readonly vehicleTypesService: VehicleTypesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleName.ADMIN, RoleName.FLEET_MANAGER, RoleName.TRANSPORT_MANAGER)
  @ApiOperation({ summary: 'Create a new vehicle type' })
  @ApiResponse({ status: 201, description: 'Vehicle type created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request / validation error' })
  @ApiResponse({ status: 409, description: 'Vehicle type code already exists in organization' })
  create(
    @CurrentUser() user: UserPayload,
    @Body() dto: CreateVehicleTypeDto,
  ) {
    return this.vehicleTypesService.create(user.organizationId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(
    RoleName.ADMIN,
    RoleName.FLEET_MANAGER,
    RoleName.TRANSPORT_MANAGER,
    RoleName.DISPATCHER,
    RoleName.VIEWER,
  )
  @ApiOperation({ summary: 'List vehicle types with search and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of vehicle types' })
  findAll(
    @CurrentUser() user: UserPayload,
    @Query() query: QueryVehicleTypeDto,
  ) {
    return this.vehicleTypesService.findAll(user.organizationId, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(
    RoleName.ADMIN,
    RoleName.FLEET_MANAGER,
    RoleName.TRANSPORT_MANAGER,
    RoleName.DISPATCHER,
    RoleName.VIEWER,
  )
  @ApiOperation({ summary: 'Get vehicle type details by ID' })
  @ApiResponse({ status: 200, description: 'Vehicle type details' })
  @ApiResponse({ status: 404, description: 'Vehicle type not found' })
  findOne(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.vehicleTypesService.findOne(user.organizationId, id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.FLEET_MANAGER, RoleName.TRANSPORT_MANAGER)
  @ApiOperation({ summary: 'Update vehicle type' })
  @ApiResponse({ status: 200, description: 'Vehicle type updated successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle type not found' })
  @ApiResponse({ status: 409, description: 'Duplicate vehicle type code' })
  update(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVehicleTypeDto,
  ) {
    return this.vehicleTypesService.update(user.organizationId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.FLEET_MANAGER)
  @ApiOperation({ summary: 'Soft delete vehicle type' })
  @ApiResponse({ status: 200, description: 'Vehicle type deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle type not found' })
  remove(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.vehicleTypesService.remove(user.organizationId, id);
  }
}
