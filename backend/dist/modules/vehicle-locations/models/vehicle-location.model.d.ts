import { Model } from 'sequelize-typescript';
import { Vehicle } from '../../vehicles/models/vehicle.model';
export declare class VehicleLocation extends Model<VehicleLocation> {
    id: string;
    organizationId: string;
    vehicleId: string;
    latitude: number;
    longitude: number;
    speed: number | null;
    heading: number | null;
    recordedAt: Date;
    source: string;
    vehicle: Vehicle;
}
