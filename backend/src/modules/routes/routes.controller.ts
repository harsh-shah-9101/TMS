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
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { QueryRouteDto } from './dto/query-route.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';
import { RoleName } from '@prisma/client';

@ApiTags('Routes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleName.ADMIN, RoleName.TRANSPORT_MANAGER, RoleName.DISPATCHER)
  @ApiOperation({ summary: 'Create a new transport route' })
  @ApiResponse({ status: 201, description: 'Route created successfully' })
  @ApiResponse({ status: 409, description: 'Route code already exists in organization' })
  create(
    @CurrentUser() user: UserPayload,
    @Body() dto: CreateRouteDto,
  ) {
    return this.routesService.create(user.organizationId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(
    RoleName.ADMIN,
    RoleName.TRANSPORT_MANAGER,
    RoleName.DISPATCHER,
    RoleName.FLEET_MANAGER,
    RoleName.VIEWER,
  )
  @ApiOperation({ summary: 'List routes with search, status filter, and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of routes' })
  findAll(
    @CurrentUser() user: UserPayload,
    @Query() query: QueryRouteDto,
  ) {
    return this.routesService.findAll(user.organizationId, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(
    RoleName.ADMIN,
    RoleName.TRANSPORT_MANAGER,
    RoleName.DISPATCHER,
    RoleName.FLEET_MANAGER,
    RoleName.VIEWER,
  )
  @ApiOperation({ summary: 'Get route details by ID' })
  @ApiResponse({ status: 200, description: 'Route details' })
  @ApiResponse({ status: 404, description: 'Route not found' })
  findOne(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.routesService.findOne(user.organizationId, id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.TRANSPORT_MANAGER)
  @ApiOperation({ summary: 'Update route details' })
  @ApiResponse({ status: 200, description: 'Route updated successfully' })
  @ApiResponse({ status: 404, description: 'Route not found' })
  update(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRouteDto,
  ) {
    return this.routesService.update(user.organizationId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.TRANSPORT_MANAGER)
  @ApiOperation({ summary: 'Soft delete route' })
  @ApiResponse({ status: 200, description: 'Route deleted successfully' })
  @ApiResponse({ status: 404, description: 'Route not found' })
  remove(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.routesService.remove(user.organizationId, id);
  }
}
