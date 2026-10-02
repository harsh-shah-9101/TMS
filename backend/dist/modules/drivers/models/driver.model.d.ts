import { Model } from 'sequelize-typescript';
export declare class Driver extends Model<Driver> {
    id: string;
    organizationId: string;
    firstName: string;
    lastName: string;
    status: string;
}
