import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DispatchService } from './dispatch.service';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { UpdateDispatchStatusDto } from './dto/update-dispatch-status.dto';
import { QueryDispatchDto } from './dto/query-dispatch.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';
import { RoleName } from '../../common/enums';

@ApiTags('Dispatch')
@ApiBearerAuth('JWT-auth')
@Controller('dispatch')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.TRANSPORT_MANAGER, RoleName.DISPATCHER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create vehicle/trip dispatch' })
  create(@CurrentUser() user: UserPayload, @Body() dto: CreateDispatchDto) {
    return this.dispatchService.create(user.organizationId, user.userId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List dispatches with filtering and pagination' })
  findAll(@CurrentUser() user: UserPayload, @Query() query: QueryDispatchDto) {
    return this.dispatchService.findAll(user.organizationId, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get dispatch details by ID' })
  findOne(@CurrentUser() user: UserPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.dispatchService.findOne(user.organizationId, id);
  }

  @Patch(':id/status')
  @Roles(RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.TRANSPORT_MANAGER, RoleName.DISPATCHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update dispatch status' })
  updateStatus(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDispatchStatusDto,
  ) {
    return this.dispatchService.updateStatus(user.organizationId, id, dto);
  }
}
