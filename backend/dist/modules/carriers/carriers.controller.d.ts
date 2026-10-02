import { CarriersService } from './carriers.service';
import { CreateCarrierDto } from './dto/create-carrier.dto';
import { UpdateCarrierDto } from './dto/update-carrier.dto';
import { QueryCarrierDto } from './dto/query-carrier.dto';
import { UserPayload } from '../../common/decorators/current-user.decorator';
export declare class CarriersController {
    private readonly carriersService;
    constructor(carriersService: CarriersService);
    create(user: UserPayload, dto: CreateCarrierDto): Promise<import("./models/carrier.model").Carrier>;
    findAll(user: UserPayload, query: QueryCarrierDto): Promise<{
        data: import("./models/carrier.model").Carrier[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(user: UserPayload, id: string): Promise<import("./models/carrier.model").Carrier>;
    update(user: UserPayload, id: string, dto: UpdateCarrierDto): Promise<import("./models/carrier.model").Carrier>;
    remove(user: UserPayload, id: string): Promise<{
        message: string;
    }>;
}
