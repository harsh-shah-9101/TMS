import { RouteStatus } from '../../../common/enums';
export declare class CreateRouteDto {
    name: string;
    code: string;
    originCity: string;
    originState?: string;
    destinationCity: string;
    destinationState?: string;
    distanceKm?: number;
    estimatedHours?: number;
    status?: RouteStatus;
}
