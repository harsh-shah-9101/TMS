import { TyresService } from './tyres.service';
import { CreateTyreDto } from './dto/create-tyres.dto';
import { QueryTyreDto } from './dto/query-tyres.dto';
export declare class TyresController {
    private readonly service;
    constructor(service: TyresService);
    create(req: any, dto: CreateTyreDto): Promise<import("./models/tyres.model").Tyre>;
    findAll(req: any, query: QueryTyreDto): Promise<{
        data: import("./models/tyres.model").Tyre[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(req: any, id: string): Promise<import("./models/tyres.model").Tyre>;
}
