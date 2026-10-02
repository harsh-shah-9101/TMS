import { DispatchService } from './dispatch.service';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { UpdateDispatchStatusDto } from './dto/update-dispatch-status.dto';
import { QueryDispatchDto } from './dto/query-dispatch.dto';
import { UserPayload } from '../../common/decorators/current-user.decorator';
export declare class DispatchController {
    private readonly dispatchService;
    constructor(dispatchService: DispatchService);
    create(user: UserPayload, dto: CreateDispatchDto): Promise<import("./models/dispatch.model").Dispatch>;
    findAll(user: UserPayload, query: QueryDispatchDto): Promise<{
        data: import("./models/dispatch.model").Dispatch[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(user: UserPayload, id: string): Promise<import("./models/dispatch.model").Dispatch>;
    updateStatus(user: UserPayload, id: string, dto: UpdateDispatchStatusDto): Promise<import("./models/dispatch.model").Dispatch>;
}
