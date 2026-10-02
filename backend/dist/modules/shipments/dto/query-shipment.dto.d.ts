import { ShipmentStatus } from '@prisma/client';
export declare class QueryShipmentDto {
    search?: string;
    status?: ShipmentStatus;
    customerId?: string;
    page?: number;
    limit?: number;
}
