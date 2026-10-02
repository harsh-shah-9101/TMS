import { VehicleType } from './models/vehicle-types.model';
import { CreateVehicleTypeDto } from './dto/create-vehicle-type.dto';
import { UpdateVehicleTypeDto } from './dto/update-vehicle-type.dto';
import { QueryVehicleTypeDto } from './dto/query-vehicle-type.dto';
export declare class VehicleTypesService {
    private vehicleTypeModel;
    constructor(vehicleTypeModel: typeof VehicleType);
    create(organizationId: string, dto: CreateVehicleTypeDto): Promise<VehicleType>;
    findAll(organizationId: string, query: QueryVehicleTypeDto): Promise<{
        data: VehicleType[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(organizationId: string, id: string): Promise<VehicleType>;
    update(organizationId: string, id: string, dto: UpdateVehicleTypeDto): Promise<VehicleType>;
    remove(organizationId: string, id: string): Promise<{
        message: string;
    }>;
}
