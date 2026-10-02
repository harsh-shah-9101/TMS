import { CreateTripDto } from './create-trip.dto';
export declare class UpdateTripDto implements Partial<CreateTripDto> {
    tripNumber?: string;
    routeId?: string;
    vehicleId?: string;
    driverId?: string;
    carrierId?: string;
    status?: any;
    plannedStartDate?: string;
    plannedEndDate?: string;
    startOdometer?: number;
    endOdometer?: number;
    remarks?: string;
    stops?: any[];
}
