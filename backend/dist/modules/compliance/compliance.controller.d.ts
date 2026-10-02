import { ComplianceService } from './compliance.service';
import { CreateComplianceDocumentDto } from './dto/create-compliance.dto';
import { QueryComplianceDocumentDto } from './dto/query-compliance.dto';
export declare class ComplianceController {
    private readonly service;
    constructor(service: ComplianceService);
    create(req: any, dto: CreateComplianceDocumentDto): Promise<import("./models/compliance.model").ComplianceDocument>;
    findAll(req: any, query: QueryComplianceDocumentDto): Promise<{
        data: import("./models/compliance.model").ComplianceDocument[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(req: any, id: string): Promise<import("./models/compliance.model").ComplianceDocument>;
}
