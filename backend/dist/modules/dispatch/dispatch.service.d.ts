import { Dispatch } from './models/dispatch.model';
import { Trip } from '../trips/models/trip.model';
import { Vehicle } from '../vehicles/models/vehicle.model';
import { Driver } from '../drivers/models/driver.model';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { UpdateDispatchStatusDto } from './dto/update-dispatch-status.dto';
import { QueryDispatchDto } from './dto/query-dispatch.dto';
export declare class DispatchService {
    private readonly dispatchModel;
    private readonly tripModel;
    private readonly vehicleModel;
    private readonly driverModel;
    constructor(dispatchModel: typeof Dispatch, tripModel: typeof Trip, vehicleModel: typeof Vehicle, driverModel: typeof Driver);
    create(organizationId: string, userId: string, dto: CreateDispatchDto): Promise<Dispatch>;
    findAll(organizationId: string, query: QueryDispatchDto): Promise<{
        data: Dispatch[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(organizationId: string, id: string): Promise<Dispatch>;
    updateStatus(organizationId: string, id: string, dto: UpdateDispatchStatusDto): Promise<Dispatch>;
}
