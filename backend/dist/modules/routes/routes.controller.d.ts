import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { QueryRouteDto } from './dto/query-route.dto';
import { UserPayload } from '../../common/decorators/current-user.decorator';
export declare class RoutesController {
    private readonly routesService;
    constructor(routesService: RoutesService);
    create(user: UserPayload, dto: CreateRouteDto): Promise<import("./models/route.model").Route>;
    findAll(user: UserPayload, query: QueryRouteDto): Promise<{
        data: import("./models/route.model").Route[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(user: UserPayload, id: string): Promise<import("./models/route.model").Route>;
    update(user: UserPayload, id: string, dto: UpdateRouteDto): Promise<import("./models/route.model").Route>;
    remove(user: UserPayload, id: string): Promise<{
        message: string;
    }>;
}
