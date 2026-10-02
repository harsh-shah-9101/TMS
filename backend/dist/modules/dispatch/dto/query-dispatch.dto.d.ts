import { DispatchStatus } from '@prisma/client';
export declare class QueryDispatchDto {
    search?: string;
    status?: DispatchStatus;
    tripId?: string;
    page?: number;
    limit?: number;
}
