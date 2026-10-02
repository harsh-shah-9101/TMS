import { TrackingEvent } from './models/tracking-event.model';
import { Trip } from '../trips/models/trip.model';
import { Vehicle } from '../vehicles/models/vehicle.model';
import { CreateTrackingEventDto } from './dto/create-tracking-event.dto';
import { QueryTrackingEventDto } from './dto/query-tracking-event.dto';
export declare class TrackingEventsService {
    private readonly eventModel;
    private readonly tripModel;
    private readonly vehicleModel;
    constructor(eventModel: typeof TrackingEvent, tripModel: typeof Trip, vehicleModel: typeof Vehicle);
    create(organizationId: string, dto: CreateTrackingEventDto): Promise<TrackingEvent>;
    findAll(organizationId: string, query: QueryTrackingEventDto): Promise<{
        data: TrackingEvent[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
