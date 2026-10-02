import { Invoice } from './models/billing.model';
import { CreateInvoiceDto } from './dto/create-billing.dto';
import { QueryInvoiceDto } from './dto/query-billing.dto';
export declare class BillingService {
    private readonly model;
    constructor(model: typeof Invoice);
    create(organizationId: string, dto: CreateInvoiceDto): Promise<Invoice>;
    findAll(organizationId: string, query: QueryInvoiceDto): Promise<{
        data: Invoice[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(organizationId: string, id: string): Promise<Invoice>;
}
