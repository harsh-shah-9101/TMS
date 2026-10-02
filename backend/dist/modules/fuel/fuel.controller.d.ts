import { FuelService } from './fuel.service';
import { CreateFuelLogDto } from './dto/create-fuel.dto';
import { QueryFuelLogDto } from './dto/query-fuel.dto';
export declare class FuelController {
    private readonly service;
    constructor(service: FuelService);
    create(req: any, dto: CreateFuelLogDto): Promise<import("./models/fuel.model").FuelLog>;
    findAll(req: any, query: QueryFuelLogDto): Promise<{
        data: import("./models/fuel.model").FuelLog[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(req: any, id: string): Promise<import("./models/fuel.model").FuelLog>;
}
