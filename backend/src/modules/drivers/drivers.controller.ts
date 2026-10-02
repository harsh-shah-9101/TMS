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
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { QueryDriverDto } from './dto/query-driver.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';
import { RoleName } from '@prisma/client';

@ApiTags('Drivers')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleName.ADMIN, RoleName.FLEET_MANAGER, RoleName.TRANSPORT_MANAGER)
  @ApiOperation({ summary: 'Register a new driver' })
  @ApiResponse({ status: 201, description: 'Driver registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request / invalid user account link' })
  @ApiResponse({ status: 409, description: 'Driver license number already exists in organization' })
  create(
    @CurrentUser() user: UserPayload,
    @Body() dto: CreateDriverDto,
  ) {
    return this.driversService.create(user.organizationId, dto);
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
  @ApiOperation({ summary: 'List drivers with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of drivers' })
  findAll(
    @CurrentUser() user: UserPayload,
    @Query() query: QueryDriverDto,
  ) {
    return this.driversService.findAll(user.organizationId, query);
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
  @ApiOperation({ summary: 'Get driver details by ID' })
  @ApiResponse({ status: 200, description: 'Driver details' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  findOne(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.driversService.findOne(user.organizationId, id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.FLEET_MANAGER, RoleName.TRANSPORT_MANAGER)
  @ApiOperation({ summary: 'Update driver details' })
  @ApiResponse({ status: 200, description: 'Driver updated successfully' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  @ApiResponse({ status: 409, description: 'Duplicate license number' })
  update(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDriverDto,
  ) {
    return this.driversService.update(user.organizationId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.FLEET_MANAGER)
  @ApiOperation({ summary: 'Soft delete driver' })
  @ApiResponse({ status: 200, description: 'Driver deleted successfully' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  remove(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.driversService.remove(user.organizationId, id);
  }
}
