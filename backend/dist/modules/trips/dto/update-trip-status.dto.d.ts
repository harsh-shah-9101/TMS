import { TripStatus } from '@prisma/client';
export declare class UpdateTripStatusDto {
    status: TripStatus;
    remarks?: string;
}
