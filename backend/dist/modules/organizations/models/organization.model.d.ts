import { Model } from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
export declare enum OrganizationStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED"
}
export declare class Organization extends Model<Organization> {
    id: string;
    name: string;
    code: string;
    status?: OrganizationStatus;
    users?: User[];
}
