import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { QueryShipmentDto } from './dto/query-shipment.dto';
import { UserPayload } from '../../common/decorators/current-user.decorator';
export declare class ShipmentsController {
    private readonly shipmentsService;
    constructor(shipmentsService: ShipmentsService);
    create(user: UserPayload, dto: CreateShipmentDto): Promise<import("./models/shipment.model").Shipment>;
    findAll(user: UserPayload, query: QueryShipmentDto): Promise<{
        data: import("./models/shipment.model").Shipment[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(user: UserPayload, id: string): Promise<import("./models/shipment.model").Shipment>;
    updateStatus(user: UserPayload, id: string, dto: UpdateShipmentStatusDto): Promise<import("./models/shipment.model").Shipment>;
    update(user: UserPayload, id: string, dto: UpdateShipmentDto): Promise<import("./models/shipment.model").Shipment>;
    remove(user: UserPayload, id: string): Promise<{
        message: string;
    }>;
}
