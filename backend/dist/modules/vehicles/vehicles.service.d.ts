import { Vehicle } from './models/vehicle.model';
import { VehicleType } from '../vehicle-types/models/vehicle-types.model';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { QueryVehicleDto } from './dto/query-vehicle.dto';
export declare class VehiclesService {
    private vehicleModel;
    private vehicleTypeModel;
    constructor(vehicleModel: typeof Vehicle, vehicleTypeModel: typeof VehicleType);
    create(organizationId: string, dto: CreateVehicleDto): Promise<Vehicle>;
    findAll(organizationId: string, query: QueryVehicleDto): Promise<{
        data: Vehicle[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(organizationId: string, id: string): Promise<Vehicle>;
    update(organizationId: string, id: string, dto: UpdateVehicleDto): Promise<Vehicle>;
    remove(organizationId: string, id: string): Promise<{
        message: string;
    }>;
}
