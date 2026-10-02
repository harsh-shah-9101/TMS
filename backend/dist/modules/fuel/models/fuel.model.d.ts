import { Model } from 'sequelize-typescript';
import { Vehicle } from '../../vehicles/models/vehicle.model';
import { Driver } from '../../drivers/models/driver.model';
export declare class FuelLog extends Model<FuelLog> {
    id: string;
    organizationId: string;
    vehicleId: string;
    driverId: string | null;
    quantity: number;
    cost: number;
    odometer: number | null;
    date: Date;
    vehicle: Vehicle;
    driver: Driver;
}
