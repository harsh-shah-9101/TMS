import { TripStatus } from '@prisma/client';
import { CreateTripStopDto } from './create-trip-stop.dto';
export declare class CreateTripDto {
    tripNumber: string;
    routeId?: string;
    vehicleId?: string;
    driverId?: string;
    carrierId?: string;
    status?: TripStatus;
    plannedStartDate?: string;
    plannedEndDate?: string;
    startOdometer?: number;
    endOdometer?: number;
    remarks?: string;
    stops?: CreateTripStopDto[];
}
