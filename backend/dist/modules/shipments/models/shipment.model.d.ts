import { Model } from 'sequelize-typescript';
import { ShipmentItem } from './shipment-item.model';
import { Customer } from '../../customers/models/customer.model';
export declare class Shipment extends Model<Shipment> {
    id: string;
    organizationId: string;
    bookingNumber: string;
    customerId: string;
    consigneeId: string | null;
    originCity: string;
    originPincode: string | null;
    destinationCity: string;
    destinationPincode: string | null;
    pickupDate: Date | null;
    expectedDeliveryDate: Date | null;
    status: string;
    totalWeightKg: number;
    totalVolumeCuFt: number;
    freightAmount: number;
    items: ShipmentItem[];
    customer: Customer;
    consignee: Customer | null;
}
