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
import { CarriersService } from './carriers.service';
import { CreateCarrierDto } from './dto/create-carrier.dto';
import { UpdateCarrierDto } from './dto/update-carrier.dto';
import { QueryCarrierDto } from './dto/query-carrier.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';
import { RoleName } from '../../common/enums';

@ApiTags('Carriers & Transporters')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('carriers')
export class CarriersController {
  constructor(private readonly carriersService: CarriersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleName.ADMIN, RoleName.TRANSPORT_MANAGER, RoleName.ACCOUNTS)
  @ApiOperation({ summary: 'Register a new carrier / transporter' })
  @ApiResponse({ status: 201, description: 'Carrier created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error / invalid GSTIN or PAN' })
  @ApiResponse({ status: 409, description: 'Carrier code already exists in organization' })
  create(
    @CurrentUser() user: UserPayload,
    @Body() dto: CreateCarrierDto,
  ) {
    return this.carriersService.create(user.organizationId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles(
    RoleName.ADMIN,
    RoleName.TRANSPORT_MANAGER,
    RoleName.DISPATCHER,
    RoleName.ACCOUNTS,
    RoleName.VIEWER,
  )
  @ApiOperation({ summary: 'List carriers with search, status filter, and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of carriers' })
  findAll(
    @CurrentUser() user: UserPayload,
    @Query() query: QueryCarrierDto,
  ) {
    return this.carriersService.findAll(user.organizationId, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(
    RoleName.ADMIN,
    RoleName.TRANSPORT_MANAGER,
    RoleName.DISPATCHER,
    RoleName.ACCOUNTS,
    RoleName.VIEWER,
  )
  @ApiOperation({ summary: 'Get carrier details by ID' })
  @ApiResponse({ status: 200, description: 'Carrier details' })
  @ApiResponse({ status: 404, description: 'Carrier not found' })
  findOne(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.carriersService.findOne(user.organizationId, id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.TRANSPORT_MANAGER, RoleName.ACCOUNTS)
  @ApiOperation({ summary: 'Update carrier details & rating' })
  @ApiResponse({ status: 200, description: 'Carrier updated successfully' })
  @ApiResponse({ status: 404, description: 'Carrier not found' })
  @ApiResponse({ status: 409, description: 'Duplicate carrier code' })
  update(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCarrierDto,
  ) {
    return this.carriersService.update(user.organizationId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.ACCOUNTS)
  @ApiOperation({ summary: 'Soft delete carrier' })
  @ApiResponse({ status: 200, description: 'Carrier deleted successfully' })
  @ApiResponse({ status: 404, description: 'Carrier not found' })
  remove(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.carriersService.remove(user.organizationId, id);
  }
}
