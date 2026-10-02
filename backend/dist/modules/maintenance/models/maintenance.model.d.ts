import { Model } from 'sequelize-typescript';
import { Vehicle } from '../../vehicles/models/vehicle.model';
export declare class MaintenanceRecord extends Model<MaintenanceRecord> {
    id: string;
    organizationId: string;
    vehicleId: string;
    date: Date;
    cost: number;
    type: string;
    description: string | null;
    vehicle: Vehicle;
}
