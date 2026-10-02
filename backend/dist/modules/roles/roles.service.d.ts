import { OnModuleInit } from '@nestjs/common';
import { Role, RoleName } from './models/role.model';
export declare class RolesService implements OnModuleInit {
    private roleModel;
    constructor(roleModel: typeof Role);
    onModuleInit(): Promise<void>;
    seedDefaultRoles(): Promise<void>;
    findByName(name: RoleName): Promise<Role | null>;
}
