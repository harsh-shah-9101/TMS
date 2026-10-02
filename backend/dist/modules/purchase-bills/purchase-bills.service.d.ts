import { PurchaseBill } from './models/purchase-bills.model';
import { CreatePurchaseBillDto } from './dto/create-purchase-bills.dto';
import { QueryPurchaseBillDto } from './dto/query-purchase-bills.dto';
export declare class PurchaseBillsService {
    private readonly model;
    constructor(model: typeof PurchaseBill);
    create(organizationId: string, dto: CreatePurchaseBillDto): Promise<PurchaseBill>;
    findAll(organizationId: string, query: QueryPurchaseBillDto): Promise<{
        data: PurchaseBill[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(organizationId: string, id: string): Promise<PurchaseBill>;
}
