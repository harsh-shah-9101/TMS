import { CustomerStatus, CustomerType } from '../../../common/enums';
export declare class QueryCustomerDto {
    search?: string;
    type?: CustomerType;
    status?: CustomerStatus;
    page?: number;
    limit?: number;
}
