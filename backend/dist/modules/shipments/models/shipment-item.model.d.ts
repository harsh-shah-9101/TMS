import { Model } from 'sequelize-typescript';
import { Shipment } from './shipment.model';
export declare class ShipmentItem extends Model<ShipmentItem> {
    id: string;
    shipmentId: string;
    description: string;
    quantity: number;
    weightKg: number;
    volumeCuFt: number;
    declaredValue: number | null;
    shipment: Shipment;
}
