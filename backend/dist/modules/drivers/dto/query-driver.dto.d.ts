import { DriverStatus } from '@prisma/client';
export declare class QueryDriverDto {
    search?: string;
    status?: DriverStatus;
    page?: number;
    limit?: number;
}
