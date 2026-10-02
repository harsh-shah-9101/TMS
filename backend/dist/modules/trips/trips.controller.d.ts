import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { UpdateTripStatusDto } from './dto/update-trip-status.dto';
import { QueryTripDto } from './dto/query-trip.dto';
import { CreateTripStopDto } from './dto/create-trip-stop.dto';
import { UpdateTripStopStatusDto } from './dto/update-trip-stop-status.dto';
import { UserPayload } from '../../common/decorators/current-user.decorator';
export declare class TripsController {
    private readonly tripsService;
    constructor(tripsService: TripsService);
    create(user: UserPayload, dto: CreateTripDto): Promise<import("./models/trip.model").Trip>;
    findAll(user: UserPayload, query: QueryTripDto): Promise<{
        data: import("./models/trip.model").Trip[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(user: UserPayload, id: string): Promise<import("./models/trip.model").Trip>;
    update(user: UserPayload, id: string, dto: UpdateTripDto): Promise<import("./models/trip.model").Trip>;
    updateStatus(user: UserPayload, id: string, dto: UpdateTripStatusDto): Promise<import("./models/trip.model").Trip>;
    addStop(user: UserPayload, id: string, dto: CreateTripStopDto): Promise<import("./models/trip.model").Trip>;
    updateStopStatus(user: UserPayload, id: string, stopId: string, dto: UpdateTripStopStatusDto): Promise<import("./models/trip-stop.model").TripStop | null>;
    removeStop(user: UserPayload, id: string, stopId: string): Promise<{
        message: string;
    }>;
    remove(user: UserPayload, id: string): Promise<{
        message: string;
    }>;
}
