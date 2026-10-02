import { DriverAdvancesService } from './driver-advances.service';
import { CreateDriverAdvanceDto } from './dto/create-driver-advances.dto';
import { QueryDriverAdvanceDto } from './dto/query-driver-advances.dto';
export declare class DriverAdvancesController {
    private readonly service;
    constructor(service: DriverAdvancesService);
    create(req: any, dto: CreateDriverAdvanceDto): Promise<import("./models/driver-advances.model").DriverAdvance>;
    findAll(req: any, query: QueryDriverAdvanceDto): Promise<{
        data: import("./models/driver-advances.model").DriverAdvance[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(req: any, id: string): Promise<import("./models/driver-advances.model").DriverAdvance>;
}
