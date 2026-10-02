import { ExceptionRecord } from './models/exceptions.model';
import { CreateExceptionRecordDto } from './dto/create-exceptions.dto';
import { QueryExceptionRecordDto } from './dto/query-exceptions.dto';
export declare class ExceptionsService {
    private readonly model;
    constructor(model: typeof ExceptionRecord);
    create(organizationId: string, dto: CreateExceptionRecordDto): Promise<ExceptionRecord>;
    findAll(organizationId: string, query: QueryExceptionRecordDto): Promise<{
        data: ExceptionRecord[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(organizationId: string, id: string): Promise<ExceptionRecord>;
}
