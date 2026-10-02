import { Settlement } from './models/settlements.model';
import { CreateSettlementDto } from './dto/create-settlements.dto';
import { QuerySettlementDto } from './dto/query-settlements.dto';
export declare class SettlementsService {
    private readonly model;
    constructor(model: typeof Settlement);
    create(organizationId: string, dto: CreateSettlementDto): Promise<Settlement>;
    findAll(organizationId: string, query: QuerySettlementDto): Promise<{
        data: Settlement[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(organizationId: string, id: string): Promise<Settlement>;
}
