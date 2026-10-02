import { VehicleLocation } from './models/vehicle-location.model';
import { Vehicle } from '../vehicles/models/vehicle.model';
import { CreateVehicleLocationDto } from './dto/create-vehicle-location.dto';
import { QueryVehicleLocationDto } from './dto/query-vehicle-location.dto';
export declare class VehicleLocationsService {
    private readonly locationModel;
    private readonly vehicleModel;
    constructor(locationModel: typeof VehicleLocation, vehicleModel: typeof Vehicle);
    create(organizationId: string, dto: CreateVehicleLocationDto): Promise<VehicleLocation>;
    findAll(organizationId: string, query: QueryVehicleLocationDto): Promise<{
        data: VehicleLocation[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getLatestLocation(organizationId: string, vehicleId: string): Promise<VehicleLocation>;
}
