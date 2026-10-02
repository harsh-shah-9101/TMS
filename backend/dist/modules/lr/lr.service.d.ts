import { LorryReceipt } from './models/lr.model';
import { Shipment } from '../shipments/models/shipment.model';
import { CreateLrDto } from './dto/create-lr.dto';
import { UpdateLrDto } from './dto/update-lr.dto';
import { QueryLrDto } from './dto/query-lr.dto';
export declare class LrService {
    private readonly lrModel;
    private readonly shipmentModel;
    constructor(lrModel: typeof LorryReceipt, shipmentModel: typeof Shipment);
    create(organizationId: string, dto: CreateLrDto): Promise<LorryReceipt>;
    findAll(organizationId: string, query: QueryLrDto): Promise<{
        data: LorryReceipt[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(organizationId: string, id: string): Promise<LorryReceipt>;
    update(organizationId: string, id: string, dto: UpdateLrDto): Promise<LorryReceipt>;
    remove(organizationId: string, id: string): Promise<{
        message: string;
    }>;
}
