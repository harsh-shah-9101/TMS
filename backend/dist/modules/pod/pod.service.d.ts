import { Pod } from './models/pod.model';
import { CreatePodDto } from './dto/create-pod.dto';
import { QueryPodDto } from './dto/query-pod.dto';
export declare class PodService {
    private readonly model;
    constructor(model: typeof Pod);
    create(organizationId: string, dto: CreatePodDto): Promise<Pod>;
    findAll(organizationId: string, query: QueryPodDto): Promise<{
        data: Pod[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(organizationId: string, id: string): Promise<Pod>;
}
