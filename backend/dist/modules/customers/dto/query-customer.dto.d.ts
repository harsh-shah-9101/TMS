import { CustomerStatus, CustomerType } from '@prisma/client';
export declare class QueryCustomerDto {
    search?: string;
    type?: CustomerType;
    status?: CustomerStatus;
    page?: number;
    limit?: number;
}
