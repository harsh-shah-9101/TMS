import { CarrierStatus } from '../../../common/enums';
export declare class QueryCarrierDto {
    search?: string;
    status?: CarrierStatus;
    page?: number;
    limit?: number;
}
