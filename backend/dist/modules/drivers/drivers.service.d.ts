import { Driver } from './models/driver.model';
import { User } from '../users/models/user.model';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { QueryDriverDto } from './dto/query-driver.dto';
export declare class DriversService {
    private driverModel;
    private userModel;
    constructor(driverModel: typeof Driver, userModel: typeof User);
    create(organizationId: string, dto: CreateDriverDto): Promise<Driver>;
    findAll(organizationId: string, query: QueryDriverDto): Promise<{
        data: Driver[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(organizationId: string, id: string): Promise<Driver>;
    update(organizationId: string, id: string, dto: UpdateDriverDto): Promise<Driver>;
    remove(organizationId: string, id: string): Promise<{
        message: string;
    }>;
}
