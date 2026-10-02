import { PodService } from './pod.service';
import { CreatePodDto } from './dto/create-pod.dto';
import { QueryPodDto } from './dto/query-pod.dto';
export declare class PodController {
    private readonly service;
    constructor(service: PodService);
    create(req: any, dto: CreatePodDto): Promise<import("./models/pod.model").Pod>;
    findAll(req: any, query: QueryPodDto): Promise<{
        data: import("./models/pod.model").Pod[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(req: any, id: string): Promise<import("./models/pod.model").Pod>;
}
