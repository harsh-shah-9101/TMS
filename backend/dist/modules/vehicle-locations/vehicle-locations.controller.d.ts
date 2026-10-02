import { VehicleLocationsService } from './vehicle-locations.service';
import { CreateVehicleLocationDto } from './dto/create-vehicle-location.dto';
import { QueryVehicleLocationDto } from './dto/query-vehicle-location.dto';
export declare class VehicleLocationsController {
    private readonly locationsService;
    constructor(locationsService: VehicleLocationsService);
    create(req: any, dto: CreateVehicleLocationDto): Promise<import("./models/vehicle-location.model").VehicleLocation>;
    findAll(req: any, query: QueryVehicleLocationDto): Promise<{
        data: import("./models/vehicle-location.model").VehicleLocation[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getLatestLocation(req: any, vehicleId: string): Promise<import("./models/vehicle-location.model").VehicleLocation>;
}
