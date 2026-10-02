import { Model } from 'sequelize-typescript';
import { Trip } from '../../trips/models/trip.model';
import { Vehicle } from '../../vehicles/models/vehicle.model';
export declare class TrackingEvent extends Model<TrackingEvent> {
    id: string;
    organizationId: string;
    tripId: string | null;
    vehicleId: string | null;
    driverId: string | null;
    shipmentId: string | null;
    eventType: string;
    description: string | null;
    latitude: number | null;
    longitude: number | null;
    eventTime: Date;
    metadata: any | null;
    source: string;
    trip: Trip;
    vehicle: Vehicle;
}
