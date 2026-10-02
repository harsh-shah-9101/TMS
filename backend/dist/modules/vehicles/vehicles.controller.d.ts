import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { QueryVehicleDto } from './dto/query-vehicle.dto';
import { UserPayload } from '../../common/decorators/current-user.decorator';
export declare class VehiclesController {
    private readonly vehiclesService;
    constructor(vehiclesService: VehiclesService);
    create(user: UserPayload, dto: CreateVehicleDto): Promise<import("./models/vehicle.model").Vehicle>;
    findAll(user: UserPayload, query: QueryVehicleDto): Promise<{
        data: import("./models/vehicle.model").Vehicle[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(user: UserPayload, id: string): Promise<import("./models/vehicle.model").Vehicle>;
    update(user: UserPayload, id: string, dto: UpdateVehicleDto): Promise<import("./models/vehicle.model").Vehicle>;
    remove(user: UserPayload, id: string): Promise<{
        message: string;
    }>;
}
