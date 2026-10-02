import { CreateTripDto } from './create-trip.dto';

export class UpdateTripDto implements Partial<CreateTripDto> {
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
}
