import { Model } from 'sequelize-typescript';
import { Vehicle } from '../../vehicles/models/vehicle.model';
import { Trip } from '../../trips/models/trip.model';
export declare class ExceptionRecord extends Model<ExceptionRecord> {
    id: string;
    organizationId: string;
    tripId: string | null;
    vehicleId: string | null;
    type: string;
    severity: string;
    description: string | null;
    trip: Trip;
    vehicle: Vehicle;
}
