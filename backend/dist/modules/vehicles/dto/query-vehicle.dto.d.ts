import { VehicleStatus, OwnershipType } from '../../../common/enums';
export declare class QueryVehicleDto {
    search?: string;
    status?: VehicleStatus;
    ownershipType?: OwnershipType;
    vehicleTypeId?: string;
    page?: number;
    limit?: number;
}
