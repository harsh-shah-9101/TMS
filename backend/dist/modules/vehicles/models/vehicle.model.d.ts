import { Model } from 'sequelize-typescript';
export declare class Vehicle extends Model<Vehicle> {
    id: string;
    organizationId: string;
    registrationNumber: string;
    status: string;
}
