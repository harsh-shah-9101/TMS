import { Model } from 'sequelize-typescript';
import { Vehicle } from '../../vehicles/models/vehicle.model';
export declare class Tyre extends Model<Tyre> {
    id: string;
    organizationId: string;
    vehicleId: string;
    serialNumber: string;
    position: string | null;
    status: string;
    vehicle: Vehicle;
}
