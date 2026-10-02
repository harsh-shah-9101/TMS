import { OwnershipType, VehicleStatus } from '../../../common/enums';
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
