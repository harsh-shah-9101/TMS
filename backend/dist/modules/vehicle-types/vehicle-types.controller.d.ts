import { VehicleTypesService } from './vehicle-types.service';
import { CreateVehicleTypeDto } from './dto/create-vehicle-type.dto';
import { UpdateVehicleTypeDto } from './dto/update-vehicle-type.dto';
import { QueryVehicleTypeDto } from './dto/query-vehicle-type.dto';
import { UserPayload } from '../../common/decorators/current-user.decorator';
export declare class VehicleTypesController {
    private readonly vehicleTypesService;
    constructor(vehicleTypesService: VehicleTypesService);
    create(user: UserPayload, dto: CreateVehicleTypeDto): Promise<any>;
    findAll(user: UserPayload, query: QueryVehicleTypeDto): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(user: UserPayload, id: string): Promise<any>;
    update(user: UserPayload, id: string, dto: UpdateVehicleTypeDto): Promise<any>;
    remove(user: UserPayload, id: string): Promise<{
        message: string;
    }>;
}
