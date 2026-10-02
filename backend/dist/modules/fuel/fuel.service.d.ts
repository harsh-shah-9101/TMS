import { FuelLog } from './models/fuel.model';
import { CreateFuelLogDto } from './dto/create-fuel.dto';
import { QueryFuelLogDto } from './dto/query-fuel.dto';
export declare class FuelService {
    private readonly model;
    constructor(model: typeof FuelLog);
    create(organizationId: string, dto: CreateFuelLogDto): Promise<FuelLog>;
    findAll(organizationId: string, query: QueryFuelLogDto): Promise<{
        data: FuelLog[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(organizationId: string, id: string): Promise<FuelLog>;
}
