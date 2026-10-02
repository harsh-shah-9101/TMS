import { ShipmentStatus } from '../../../common/enums';
export declare class QueryShipmentDto {
    search?: string;
    status?: ShipmentStatus;
    customerId?: string;
    page?: number;
    limit?: number;
}
