import { PurchaseBillsService } from './purchase-bills.service';
import { CreatePurchaseBillDto } from './dto/create-purchase-bills.dto';
import { QueryPurchaseBillDto } from './dto/query-purchase-bills.dto';
export declare class PurchaseBillsController {
    private readonly service;
    constructor(service: PurchaseBillsService);
    create(req: any, dto: CreatePurchaseBillDto): Promise<import("./models/purchase-bills.model").PurchaseBill>;
    findAll(req: any, query: QueryPurchaseBillDto): Promise<{
        data: import("./models/purchase-bills.model").PurchaseBill[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(req: any, id: string): Promise<import("./models/purchase-bills.model").PurchaseBill>;
}
