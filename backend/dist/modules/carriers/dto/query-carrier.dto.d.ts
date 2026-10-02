import { CarrierStatus } from '@prisma/client';
export declare class QueryCarrierDto {
    search?: string;
    status?: CarrierStatus;
    page?: number;
    limit?: number;
}
