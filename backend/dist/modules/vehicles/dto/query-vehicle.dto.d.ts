import { VehicleStatus, OwnershipType } from '@prisma/client';
export declare class QueryVehicleDto {
    search?: string;
    status?: VehicleStatus;
    ownershipType?: OwnershipType;
    vehicleTypeId?: string;
    page?: number;
    limit?: number;
}
