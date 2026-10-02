import { Model } from 'sequelize-typescript';
import { Vehicle } from '../../vehicles/models/vehicle.model';
import { Driver } from '../../drivers/models/driver.model';
export declare class ComplianceDocument extends Model<ComplianceDocument> {
    id: string;
    organizationId: string;
    vehicleId: string | null;
    driverId: string | null;
    type: string;
    expiryDate: Date;
    documentUrl: string | null;
    vehicle: Vehicle;
    driver: Driver;
}
