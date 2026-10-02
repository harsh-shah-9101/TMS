import { ShipmentStatus } from '@prisma/client';
import { CreateShipmentItemDto } from './create-shipment-item.dto';
export declare class CreateShipmentDto {
    bookingNumber: string;
    customerId: string;
    consigneeId?: string;
    originCity: string;
    originPincode?: string;
    destinationCity: string;
    destinationPincode?: string;
    pickupDate?: string;
    expectedDeliveryDate?: string;
    status?: ShipmentStatus;
    freightAmount?: number;
    items?: CreateShipmentItemDto[];
}
