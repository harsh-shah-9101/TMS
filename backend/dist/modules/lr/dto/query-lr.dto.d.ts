import { FreightTerm, LRStatus } from '@prisma/client';
export declare class QueryLrDto {
    search?: string;
    status?: LRStatus;
    freightTerms?: FreightTerm;
    shipmentId?: string;
    page?: number;
    limit?: number;
}
