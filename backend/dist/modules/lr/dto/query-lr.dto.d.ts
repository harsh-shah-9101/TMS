import { FreightTerm, LRStatus } from '../../../common/enums';
export declare class QueryLrDto {
    search?: string;
    status?: LRStatus;
    freightTerms?: FreightTerm;
    shipmentId?: string;
    page?: number;
    limit?: number;
}
