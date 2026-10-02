import { Model } from 'sequelize-typescript';
import { Route } from '../../routes/models/route.model';
import { Vehicle } from '../../vehicles/models/vehicle.model';
import { Driver } from '../../drivers/models/driver.model';
import { Carrier } from '../../carriers/models/carrier.model';
import { TripStop } from './trip-stop.model';
export declare class Trip extends Model<Trip> {
    id: string;
    organizationId: string;
    tripNumber: string;
    routeId: string | null;
    vehicleId: string | null;
    driverId: string | null;
    carrierId: string | null;
    status: string;
    plannedStartDate: Date | null;
    plannedEndDate: Date | null;
    actualStartDate: Date | null;
    actualEndDate: Date | null;
    startOdometer: number | null;
    endOdometer: number | null;
    remarks: string | null;
    route: Route;
    vehicle: Vehicle;
    driver: Driver;
    carrier: Carrier;
    stops: TripStop[];
}
