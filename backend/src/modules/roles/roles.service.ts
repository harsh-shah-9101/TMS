import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Role, RoleName } from './models/role.model';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(@InjectModel(Role) private roleModel: typeof Role) {}

  async onModuleInit() {
    await this.seedDefaultRoles();
  }

  async seedDefaultRoles() {
    const roles: { name: RoleName; description: string }[] = [
      { name: RoleName.SUPER_ADMIN, description: 'Super Administrator with global platform rights' },
      { name: RoleName.ADMIN, description: 'Organization Administrator' },
      { name: RoleName.TRANSPORT_MANAGER, description: 'Manages transport bookings, shipments, and trips' },
      { name: RoleName.DISPATCHER, description: 'Manages vehicle dispatch and trip execution' },
      { name: RoleName.FLEET_MANAGER, description: 'Manages vehicles, maintenance, and fuel operations' },
      { name: RoleName.ACCOUNTS, description: 'Manages billing, settlements, and advances' },
      { name: RoleName.DRIVER, description: 'Executes trips and reports status' },
      { name: RoleName.VIEWER, description: 'Read-only access to organization operations' },
    ];

    for (const roleData of roles) {
      const [role, created] = await this.roleModel.findOrCreate({
        where: { name: roleData.name },
        defaults: roleData as any,
      });
      if (!created) {
        await role.update(roleData);
      }
    }
  }

  async findByName(name: RoleName) {
    return this.roleModel.findOne({
      where: { name },
    });
  }
}
