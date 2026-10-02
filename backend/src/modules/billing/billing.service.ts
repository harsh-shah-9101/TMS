import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Invoice } from './models/billing.model';
import { CreateInvoiceDto } from './dto/create-billing.dto';
import { QueryInvoiceDto } from './dto/query-billing.dto';

@Injectable()
export class BillingService {
  constructor(@InjectModel(Invoice) private readonly model: typeof Invoice) {}

  async create(organizationId: string, dto: CreateInvoiceDto) {
    return this.model.create({ organizationId, ...dto } as any);
  }

  async findAll(organizationId: string, query: QueryInvoiceDto) {
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
