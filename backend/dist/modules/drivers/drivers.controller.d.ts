import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { QueryDriverDto } from './dto/query-driver.dto';
import { UserPayload } from '../../common/decorators/current-user.decorator';
export declare class DriversController {
    private readonly driversService;
    constructor(driversService: DriversService);
    create(user: UserPayload, dto: CreateDriverDto): Promise<import("./models/driver.model").Driver>;
    findAll(user: UserPayload, query: QueryDriverDto): Promise<{
        data: import("./models/driver.model").Driver[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(user: UserPayload, id: string): Promise<import("./models/driver.model").Driver>;
    update(user: UserPayload, id: string, dto: UpdateDriverDto): Promise<import("./models/driver.model").Driver>;
    remove(user: UserPayload, id: string): Promise<{
        message: string;
    }>;
}
