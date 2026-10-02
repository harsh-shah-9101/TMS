import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceRecordDto } from './dto/create-maintenance.dto';
import { QueryMaintenanceRecordDto } from './dto/query-maintenance.dto';
export declare class MaintenanceController {
    private readonly service;
    constructor(service: MaintenanceService);
    create(req: any, dto: CreateMaintenanceRecordDto): Promise<import("./models/maintenance.model").MaintenanceRecord>;
    findAll(req: any, query: QueryMaintenanceRecordDto): Promise<{
        data: import("./models/maintenance.model").MaintenanceRecord[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(req: any, id: string): Promise<import("./models/maintenance.model").MaintenanceRecord>;
}
