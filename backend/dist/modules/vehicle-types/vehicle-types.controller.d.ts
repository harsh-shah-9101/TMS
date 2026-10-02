import { VehicleTypesService } from './vehicle-types.service';
import { CreateVehicleTypeDto } from './dto/create-vehicle-type.dto';
import { UpdateVehicleTypeDto } from './dto/update-vehicle-type.dto';
import { QueryVehicleTypeDto } from './dto/query-vehicle-type.dto';
import { UserPayload } from '../../common/decorators/current-user.decorator';
export declare class VehicleTypesController {
    private readonly vehicleTypesService;
    constructor(vehicleTypesService: VehicleTypesService);
    create(user: UserPayload, dto: CreateVehicleTypeDto): Promise<import("./models/vehicle-types.model").VehicleType>;
    findAll(user: UserPayload, query: QueryVehicleTypeDto): Promise<{
        data: import("./models/vehicle-types.model").VehicleType[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(user: UserPayload, id: string): Promise<import("./models/vehicle-types.model").VehicleType>;
    update(user: UserPayload, id: string, dto: UpdateVehicleTypeDto): Promise<import("./models/vehicle-types.model").VehicleType>;
    remove(user: UserPayload, id: string): Promise<{
        message: string;
    }>;
}
