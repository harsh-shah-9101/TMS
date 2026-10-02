import { Model } from 'sequelize-typescript';
import { Trip } from '../../trips/models/trip.model';
export declare class Dispatch extends Model<Dispatch> {
    id: string;
    organizationId: string;
    tripId: string;
    dispatchNumber: string;
    gatePassNumber: string | null;
    status: string;
    dispatchedAt: Date;
    dispatchedByUserId: string | null;
    remarks: string | null;
    trip: Trip;
}
