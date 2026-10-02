import { Tyre } from './models/tyres.model';
import { CreateTyreDto } from './dto/create-tyres.dto';
import { QueryTyreDto } from './dto/query-tyres.dto';
export declare class TyresService {
    private readonly model;
    constructor(model: typeof Tyre);
    create(organizationId: string, dto: CreateTyreDto): Promise<Tyre>;
    findAll(organizationId: string, query: QueryTyreDto): Promise<{
        data: Tyre[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(organizationId: string, id: string): Promise<Tyre>;
}
