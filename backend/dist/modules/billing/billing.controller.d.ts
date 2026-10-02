import { BillingService } from './billing.service';
import { CreateInvoiceDto } from './dto/create-billing.dto';
import { QueryInvoiceDto } from './dto/query-billing.dto';
export declare class BillingController {
    private readonly service;
    constructor(service: BillingService);
    create(req: any, dto: CreateInvoiceDto): Promise<import("./models/billing.model").Invoice>;
    findAll(req: any, query: QueryInvoiceDto): Promise<{
        data: import("./models/billing.model").Invoice[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(req: any, id: string): Promise<import("./models/billing.model").Invoice>;
}
