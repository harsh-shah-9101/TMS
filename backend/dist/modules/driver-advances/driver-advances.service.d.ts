import { DriverAdvance } from './models/driver-advances.model';
import { CreateDriverAdvanceDto } from './dto/create-driver-advances.dto';
import { QueryDriverAdvanceDto } from './dto/query-driver-advances.dto';
export declare class DriverAdvancesService {
    private readonly model;
    constructor(model: typeof DriverAdvance);
    create(organizationId: string, dto: CreateDriverAdvanceDto): Promise<DriverAdvance>;
    findAll(organizationId: string, query: QueryDriverAdvanceDto): Promise<{
        data: DriverAdvance[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(organizationId: string, id: string): Promise<DriverAdvance>;
}
