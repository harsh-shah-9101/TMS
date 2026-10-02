import { FuelType, VehicleTypeStatus } from '@prisma/client';
export declare class CreateVehicleTypeDto {
    name: string;
    code: string;
    capacityTons: number;
    volumeCuFt?: number;
    axleCount?: number;
    fuelType?: FuelType;
    status?: VehicleTypeStatus;
}
