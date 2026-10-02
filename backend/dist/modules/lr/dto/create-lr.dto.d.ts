import { FreightTerm, LRStatus } from '../../../common/enums';
export declare class CreateLrDto {
    shipmentId: string;
    lrNumber: string;
    consignorName: string;
    consignorAddress?: string;
    consigneeName: string;
    consigneeAddress?: string;
    freightTerms?: FreightTerm;
    basicFreight?: number;
    otherCharges?: number;
    taxAmount?: number;
    remarks?: string;
    status?: LRStatus;
}
