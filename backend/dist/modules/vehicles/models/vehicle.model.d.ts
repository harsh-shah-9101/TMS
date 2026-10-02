import { Model } from 'sequelize-typescript';
import { VehicleType } from '../../vehicle-types/models/vehicle-types.model';
export declare class Vehicle extends Model<Vehicle> {
    id: string;
    organizationId: string;
    vehicleTypeId: string;
    vehicleType: VehicleType;
    registrationNumber: string;
    chassisNumber?: string;
    engineNumber?: string;
    make?: string;
    model?: string;
    year?: number;
    ownershipType?: string;
    currentOdometer?: number;
    status?: string;
}
