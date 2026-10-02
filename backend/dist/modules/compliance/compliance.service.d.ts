import { ComplianceDocument } from './models/compliance.model';
import { CreateComplianceDocumentDto } from './dto/create-compliance.dto';
import { QueryComplianceDocumentDto } from './dto/query-compliance.dto';
export declare class ComplianceService {
    private readonly model;
    constructor(model: typeof ComplianceDocument);
    create(organizationId: string, dto: CreateComplianceDocumentDto): Promise<ComplianceDocument>;
    findAll(organizationId: string, query: QueryComplianceDocumentDto): Promise<{
        data: ComplianceDocument[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(organizationId: string, id: string): Promise<ComplianceDocument>;
}
