import { Model } from 'sequelize-typescript';
export declare class Route extends Model<Route> {
    id: string;
    organizationId: string;
    name: string;
    code: string;
    originCity: string;
    originState: string | null;
    destinationCity: string;
    destinationState: string | null;
    distanceKm: number;
    estimatedHours: number;
    status: string;
}
