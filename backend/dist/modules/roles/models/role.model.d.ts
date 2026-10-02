import { Model } from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
export declare enum RoleName {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    TRANSPORT_MANAGER = "TRANSPORT_MANAGER",
    DISPATCHER = "DISPATCHER",
    FLEET_MANAGER = "FLEET_MANAGER",
    ACCOUNTS = "ACCOUNTS",
    DRIVER = "DRIVER",
    VIEWER = "VIEWER"
}
export declare class Role extends Model<Role> {
    id: string;
    name: RoleName;
    description?: string;
    users?: User[];
}
