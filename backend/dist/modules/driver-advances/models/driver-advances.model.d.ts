import { Model } from 'sequelize-typescript';
import { Driver } from '../../drivers/models/driver.model';
import { Trip } from '../../trips/models/trip.model';
export declare class DriverAdvance extends Model<DriverAdvance> {
    id: string;
    organizationId: string;
    driverId: string;
    tripId: string | null;
    amount: number;
    date: Date;
    reason: string | null;
    driver: Driver;
    trip: Trip;
}
