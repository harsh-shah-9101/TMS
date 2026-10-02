import { StopType, StopStatus } from '../../../common/enums';
export declare class CreateTripStopDto {
    sequence?: number;
    shipmentId?: string;
    stopType?: StopType;
    locationName: string;
    city: string;
    pincode?: string;
    status?: StopStatus;
    remarks?: string;
}
