import { Carrier } from './models/carrier.model';
import { CreateCarrierDto } from './dto/create-carrier.dto';
import { UpdateCarrierDto } from './dto/update-carrier.dto';
import { QueryCarrierDto } from './dto/query-carrier.dto';
export declare class CarriersService {
    private readonly carrierModel;
    constructor(carrierModel: typeof Carrier);
    create(organizationId: string, dto: CreateCarrierDto): Promise<Carrier>;
    findAll(organizationId: string, query: QueryCarrierDto): Promise<{
        data: Carrier[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(organizationId: string, id: string): Promise<Carrier>;
    update(organizationId: string, id: string, dto: UpdateCarrierDto): Promise<Carrier>;
    remove(organizationId: string, id: string): Promise<{
        message: string;
    }>;
}
