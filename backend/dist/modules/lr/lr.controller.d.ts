import { LrService } from './lr.service';
import { CreateLrDto } from './dto/create-lr.dto';
import { UpdateLrDto } from './dto/update-lr.dto';
import { QueryLrDto } from './dto/query-lr.dto';
import { UserPayload } from '../../common/decorators/current-user.decorator';
export declare class LrController {
    private readonly lrService;
    constructor(lrService: LrService);
    create(user: UserPayload, dto: CreateLrDto): Promise<import("./models/lr.model").LorryReceipt>;
    findAll(user: UserPayload, query: QueryLrDto): Promise<{
        data: import("./models/lr.model").LorryReceipt[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(user: UserPayload, id: string): Promise<import("./models/lr.model").LorryReceipt>;
    update(user: UserPayload, id: string, dto: UpdateLrDto): Promise<import("./models/lr.model").LorryReceipt>;
    remove(user: UserPayload, id: string): Promise<{
        message: string;
    }>;
}
