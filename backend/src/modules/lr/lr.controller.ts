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
import { LrService } from './lr.service';
import { CreateLrDto } from './dto/create-lr.dto';
import { UpdateLrDto } from './dto/update-lr.dto';
import { QueryLrDto } from './dto/query-lr.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, UserPayload } from '../../common/decorators/current-user.decorator';
import { RoleName } from '../../common/enums';

@ApiTags('LR (Lorry Receipts)')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lr')
export class LrController {
  constructor(private readonly lrService: LrService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleName.ADMIN, RoleName.TRANSPORT_MANAGER, RoleName.DISPATCHER)
  @ApiOperation({ summary: 'Generate a new Lorry Receipt (LR)' })
  @ApiResponse({ status: 201, description: 'Lorry Receipt generated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request / invalid shipment ID' })
  @ApiResponse({ status: 409, description: 'LR number already exists in organization' })
  create(
    @CurrentUser() user: UserPayload,
    @Body() dto: CreateLrDto,
  ) {
    return this.lrService.create(user.organizationId, dto);
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
  @ApiOperation({ summary: 'List Lorry Receipts with search & pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of Lorry Receipts' })
  findAll(
    @CurrentUser() user: UserPayload,
    @Query() query: QueryLrDto,
  ) {
    return this.lrService.findAll(user.organizationId, query);
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
  @ApiOperation({ summary: 'Get Lorry Receipt details by ID' })
  @ApiResponse({ status: 200, description: 'Lorry Receipt details' })
  @ApiResponse({ status: 404, description: 'Lorry Receipt not found' })
  findOne(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.lrService.findOne(user.organizationId, id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.TRANSPORT_MANAGER, RoleName.ACCOUNTS)
  @ApiOperation({ summary: 'Update Lorry Receipt details & freight charges' })
  @ApiResponse({ status: 200, description: 'Lorry Receipt updated successfully' })
  @ApiResponse({ status: 404, description: 'Lorry Receipt not found' })
  update(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLrDto,
  ) {
    return this.lrService.update(user.organizationId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleName.ADMIN, RoleName.TRANSPORT_MANAGER)
  @ApiOperation({ summary: 'Soft delete Lorry Receipt' })
  @ApiResponse({ status: 200, description: 'Lorry Receipt deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lorry Receipt not found' })
  remove(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.lrService.remove(user.organizationId, id);
  }
}
