import { OwnershipType, VehicleStatus } from '@prisma/client';
export declare class CreateVehicleDto {
    vehicleTypeId: string;
    registrationNumber: string;
    chassisNumber?: string;
    engineNumber?: string;
    make?: string;
    model?: string;
    year?: number;
    status?: VehicleStatus;
    ownershipType?: OwnershipType;
    currentOdometer?: number;
}
