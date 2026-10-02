import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Route } from './models/route.model';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { QueryRouteDto } from './dto/query-route.dto';

@Injectable()
export class RoutesService {
  constructor(
    @InjectModel(Route)
    private readonly routeModel: typeof Route,
  ) {}

  async create(organizationId: string, dto: CreateRouteDto) {
    const formattedCode = dto.code.toUpperCase();

    try {
      const route = await this.routeModel.create({
        organizationId,
        name: dto.name,
        code: formattedCode,
        originCity: dto.originCity,
        originState: dto.originState,
        destinationCity: dto.destinationCity,
        destinationState: dto.destinationState,
        distanceKm: dto.distanceKm || 0,
        estimatedHours: dto.estimatedHours || 0,
        status: dto.status,
      } as any);

      return route;
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException(
          `Route with code '${formattedCode}' already exists in your organization`,
        );
      }
      throw error;
    }
  }

  async findAll(organizationId: string, query: QueryRouteDto) {
    const { search, status, page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const where: any = { organizationId };

    if (status) where.status = status;

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
        { originCity: { [Op.iLike]: `%${search}%` } },
        { destinationCity: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows: data, count: total } = await this.routeModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(organizationId: string, id: string) {
    const route = await this.routeModel.findOne({
      where: { id, organizationId },
    });

    if (!route) {
      throw new NotFoundException(`Route with ID '${id}' not found`);
    }

    return route;
  }

  async update(organizationId: string, id: string, dto: UpdateRouteDto) {
    await this.findOne(organizationId, id);

    let formattedCode: string | undefined;

    if (dto.code) {
      formattedCode = dto.code.toUpperCase();
    }

    try {
      const data: any = {};
      if (dto.name) data.name = dto.name;
      if (formattedCode) data.code = formattedCode;
      if (dto.originCity) data.originCity = dto.originCity;
      if (dto.originState !== undefined) data.originState = dto.originState;
      if (dto.destinationCity) data.destinationCity = dto.destinationCity;
      if (dto.destinationState !== undefined) data.destinationState = dto.destinationState;
      if (dto.distanceKm !== undefined) data.distanceKm = dto.distanceKm;
      if (dto.estimatedHours !== undefined) data.estimatedHours = dto.estimatedHours;
      if (dto.status) data.status = dto.status;

      await this.routeModel.update(data, {
        where: { id, organizationId },
      });

      return this.findOne(organizationId, id);
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException(
          `Route with code '${formattedCode}' already exists in your organization`,
        );
      }
      throw error;
    }
  }

  async remove(organizationId: string, id: string) {
    const route = await this.findOne(organizationId, id);

    await route.destroy();

    return { message: 'Route deleted successfully' };
  }
}
