import { Route } from './models/route.model';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { QueryRouteDto } from './dto/query-route.dto';
export declare class RoutesService {
    private readonly routeModel;
    constructor(routeModel: typeof Route);
    create(organizationId: string, dto: CreateRouteDto): Promise<Route>;
    findAll(organizationId: string, query: QueryRouteDto): Promise<{
        data: Route[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(organizationId: string, id: string): Promise<Route>;
    update(organizationId: string, id: string, dto: UpdateRouteDto): Promise<Route>;
    remove(organizationId: string, id: string): Promise<{
        message: string;
    }>;
}
