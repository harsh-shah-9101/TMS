import { MaintenanceRecord } from './models/maintenance.model';
import { CreateMaintenanceRecordDto } from './dto/create-maintenance.dto';
import { QueryMaintenanceRecordDto } from './dto/query-maintenance.dto';
export declare class MaintenanceService {
    private readonly model;
    constructor(model: typeof MaintenanceRecord);
    create(organizationId: string, dto: CreateMaintenanceRecordDto): Promise<MaintenanceRecord>;
    findAll(organizationId: string, query: QueryMaintenanceRecordDto): Promise<{
        data: MaintenanceRecord[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(organizationId: string, id: string): Promise<MaintenanceRecord>;
}
