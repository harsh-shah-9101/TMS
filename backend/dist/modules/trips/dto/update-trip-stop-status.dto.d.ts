import { StopStatus } from '../../../common/enums';
export declare class UpdateTripStopStatusDto {
    status: StopStatus;
    arrivalTime?: string;
    departureTime?: string;
    remarks?: string;
}
