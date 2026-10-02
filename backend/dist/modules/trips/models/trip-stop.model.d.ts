import { Model } from 'sequelize-typescript';
import { Trip } from './trip.model';
import { Shipment } from '../../shipments/models/shipment.model';
export declare class TripStop extends Model<TripStop> {
    id: string;
    sequence: number;
    tripId: string;
    shipmentId: string | null;
    stopType: string;
    locationName: string;
    city: string;
    pincode: string | null;
    status: string;
    arrivalTime: Date | null;
    departureTime: Date | null;
    remarks: string | null;
    trip: Trip;
    shipment: Shipment;
}
