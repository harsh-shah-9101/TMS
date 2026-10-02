import { Model } from 'sequelize-typescript';
import { Organization } from '../../organizations/models/organization.model';
import { Role } from '../../roles/models/role.model';
export declare enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED"
}
export declare class User extends Model<User> {
    id: string;
    organizationId: string;
    organization: Organization;
    roleId: string;
    role: Role;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    status: UserStatus;
    refreshToken: string;
    lastLoginAt: Date;
}
