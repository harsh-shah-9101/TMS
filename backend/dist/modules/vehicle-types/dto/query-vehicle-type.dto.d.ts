import { VehicleTypeStatus, FuelType } from '../../../common/enums';
export declare class QueryVehicleTypeDto {
    search?: string;
    status?: VehicleTypeStatus;
    fuelType?: FuelType;
    page?: number;
    limit?: number;
}
