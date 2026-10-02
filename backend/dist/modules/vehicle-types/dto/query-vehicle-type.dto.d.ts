import { VehicleTypeStatus, FuelType } from '@prisma/client';
export declare class QueryVehicleTypeDto {
    search?: string;
    status?: VehicleTypeStatus;
    fuelType?: FuelType;
    page?: number;
    limit?: number;
}
