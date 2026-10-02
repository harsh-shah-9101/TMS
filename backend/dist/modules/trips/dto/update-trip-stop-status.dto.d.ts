import { StopStatus } from '@prisma/client';
export declare class UpdateTripStopStatusDto {
    status: StopStatus;
    arrivalTime?: string;
    departureTime?: string;
    remarks?: string;
}
