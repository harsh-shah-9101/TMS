import { Model } from 'sequelize-typescript';
import { Trip } from '../../trips/models/trip.model';
import { Shipment } from '../../shipments/models/shipment.model';
export declare class Pod extends Model<Pod> {
    id: string;
    organizationId: string;
    shipmentId: string;
    tripId: string;
    receivedBy: string | null;
    signatureUrl: string | null;
    shortageQty: number | null;
    shipment: Shipment;
    trip: Trip;
}
