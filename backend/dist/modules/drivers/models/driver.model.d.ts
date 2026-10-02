import { Model } from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
export declare class Driver extends Model<Driver> {
    id: string;
    organizationId: string;
    firstName: string;
    lastName: string;
    phone?: string;
    licenseNumber?: string;
    licenseCategory?: string;
    licenseExpiry?: Date;
    userId?: string;
    user?: User;
    status?: string;
}
