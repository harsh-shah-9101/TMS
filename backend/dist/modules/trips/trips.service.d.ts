import { Trip } from './models/trip.model';
import { TripStop } from './models/trip-stop.model';
import { Route } from '../routes/models/route.model';
import { Vehicle } from '../vehicles/models/vehicle.model';
import { Driver } from '../drivers/models/driver.model';
import { Carrier } from '../carriers/models/carrier.model';
import { Shipment } from '../shipments/models/shipment.model';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { UpdateTripStatusDto } from './dto/update-trip-status.dto';
import { QueryTripDto } from './dto/query-trip.dto';
import { CreateTripStopDto } from './dto/create-trip-stop.dto';
import { UpdateTripStopStatusDto } from './dto/update-trip-stop-status.dto';
export declare class TripsService {
    private readonly tripModel;
    private readonly tripStopModel;
    private readonly routeModel;
    private readonly vehicleModel;
    private readonly driverModel;
    private readonly carrierModel;
    private readonly shipmentModel;
    constructor(tripModel: typeof Trip, tripStopModel: typeof TripStop, routeModel: typeof Route, vehicleModel: typeof Vehicle, driverModel: typeof Driver, carrierModel: typeof Carrier, shipmentModel: typeof Shipment);
    private readonly allowedTransitions;
    create(organizationId: string, dto: CreateTripDto): Promise<Trip>;
    findAll(organizationId: string, query: QueryTripDto): Promise<{
        data: Trip[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(organizationId: string, id: string): Promise<Trip>;
    update(organizationId: string, id: string, dto: UpdateTripDto): Promise<Trip>;
    updateStatus(organizationId: string, id: string, dto: UpdateTripStatusDto): Promise<Trip>;
    addStop(organizationId: string, tripId: string, dto: CreateTripStopDto): Promise<Trip>;
    updateStopStatus(organizationId: string, tripId: string, stopId: string, dto: UpdateTripStopStatusDto): Promise<TripStop | null>;
    removeStop(organizationId: string, tripId: string, stopId: string): Promise<{
        message: string;
    }>;
    remove(organizationId: string, id: string): Promise<{
        message: string;
    }>;
}
