import { SettlementsService } from './settlements.service';
import { CreateSettlementDto } from './dto/create-settlements.dto';
import { QuerySettlementDto } from './dto/query-settlements.dto';
export declare class SettlementsController {
    private readonly service;
    constructor(service: SettlementsService);
    create(req: any, dto: CreateSettlementDto): Promise<import("./models/settlements.model").Settlement>;
    findAll(req: any, query: QuerySettlementDto): Promise<{
        data: import("./models/settlements.model").Settlement[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(req: any, id: string): Promise<import("./models/settlements.model").Settlement>;
}
