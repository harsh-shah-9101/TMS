import { TripStatus } from '@prisma/client';
export declare class QueryTripDto {
    search?: string;
    status?: TripStatus;
    vehicleId?: string;
    driverId?: string;
    carrierId?: string;
    routeId?: string;
    page?: number;
    limit?: number;
}
