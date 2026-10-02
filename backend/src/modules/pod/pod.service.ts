import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Pod } from './models/pod.model';
import { CreatePodDto } from './dto/create-pod.dto';
import { QueryPodDto } from './dto/query-pod.dto';

@Injectable()
export class PodService {
  constructor(@InjectModel(Pod) private readonly model: typeof Pod) {}

  async create(organizationId: string, dto: CreatePodDto) {
    return this.model.create({ organizationId, ...dto } as any);
  }

  async findAll(organizationId: string, query: QueryPodDto) {
    const limit = parseInt(query.limit || '10', 10);
    const offset = (parseInt(query.page || '1', 10) - 1) * limit;

    const where: any = { organizationId };

    const { rows: data, count: total } = await this.model.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      data,
      meta: {
        total,
        page: parseInt(query.page || '1', 10),
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(organizationId: string, id: string) {
    const record = await this.model.findOne({ where: { id, organizationId } });
    if (!record) throw new NotFoundException('Record not found');
    return record;
  }
}
