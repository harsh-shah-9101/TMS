import { TrackingEventsService } from './tracking-events.service';
import { CreateTrackingEventDto } from './dto/create-tracking-event.dto';
import { QueryTrackingEventDto } from './dto/query-tracking-event.dto';
export declare class TrackingEventsController {
    private readonly eventsService;
    constructor(eventsService: TrackingEventsService);
    create(req: any, dto: CreateTrackingEventDto): Promise<import("./models/tracking-event.model").TrackingEvent>;
    findAll(req: any, query: QueryTrackingEventDto): Promise<{
        data: import("./models/tracking-event.model").TrackingEvent[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
