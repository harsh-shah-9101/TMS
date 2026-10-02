import { RouteStatus } from '@prisma/client';
export declare class QueryRouteDto {
    search?: string;
    status?: RouteStatus;
    page?: number;
    limit?: number;
}
