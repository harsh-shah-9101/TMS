import { Shipment } from './models/shipment.model';
import { Customer } from '../customers/models/customer.model';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { QueryShipmentDto } from './dto/query-shipment.dto';
export declare class ShipmentsService {
    private readonly shipmentModel;
    private readonly customerModel;
    constructor(shipmentModel: typeof Shipment, customerModel: typeof Customer);
    private readonly allowedTransitions;
    create(organizationId: string, dto: CreateShipmentDto): Promise<Shipment>;
    findAll(organizationId: string, query: QueryShipmentDto): Promise<{
        data: Shipment[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(organizationId: string, id: string): Promise<Shipment>;
    updateStatus(organizationId: string, id: string, dto: UpdateShipmentStatusDto): Promise<Shipment>;
    update(organizationId: string, id: string, dto: UpdateShipmentDto): Promise<Shipment>;
    remove(organizationId: string, id: string): Promise<{
        message: string;
    }>;
}
