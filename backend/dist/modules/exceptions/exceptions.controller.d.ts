import { ExceptionsService } from './exceptions.service';
import { CreateExceptionRecordDto } from './dto/create-exceptions.dto';
import { QueryExceptionRecordDto } from './dto/query-exceptions.dto';
export declare class ExceptionsController {
    private readonly service;
    constructor(service: ExceptionsService);
    create(req: any, dto: CreateExceptionRecordDto): Promise<import("./models/exceptions.model").ExceptionRecord>;
    findAll(req: any, query: QueryExceptionRecordDto): Promise<{
        data: import("./models/exceptions.model").ExceptionRecord[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(req: any, id: string): Promise<import("./models/exceptions.model").ExceptionRecord>;
}
