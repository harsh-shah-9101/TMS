import { Model } from 'sequelize-typescript';
export declare class VehicleType extends Model<VehicleType> {
    id: string;
    organizationId: string;
    name: string;
    code: string;
    capacityTons?: number;
    volumeCuFt?: number;
    axleCount?: number;
    fuelType?: string;
    status?: string;
}
