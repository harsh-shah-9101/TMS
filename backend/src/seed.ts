import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/sequelize';
import { User } from './modules/users/models/user.model';
import { Organization, OrganizationStatus } from './modules/organizations/models/organization.model';
import { Role, RoleName } from './modules/roles/models/role.model';
import * as bcrypt from 'bcrypt';
import { UserStatus } from './common/enums';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const userModel = app.get<typeof User>(getModelToken(User));
  const orgModel = app.get<typeof Organization>(getModelToken(Organization));
  const roleModel = app.get<typeof Role>(getModelToken(Role));

  console.log('Seeding Super Admin...');

  const superAdminRole = await roleModel.findOne({ where: { name: RoleName.SUPER_ADMIN } });
  if (!superAdminRole) {
    console.error('Super Admin role not found. Ensure RolesService has seeded it.');
    process.exit(1);
  }

  const orgParams = {
    name: 'Super Admin Organization',
    code: 'SA_ORG',
    status: OrganizationStatus.ACTIVE,
  };

  let org = await orgModel.findOne({ where: { code: 'SA_ORG' } });
  if (!org) {
    org = await orgModel.create(orgParams as any);
  }

  const email = 'superadmin@example.com';
  let user = await userModel.findOne({ where: { email } });
  if (!user) {
    const hashedPassword = await bcrypt.hash('superadmin123', 10);
    await userModel.create({
      organizationId: org.id,
      roleId: superAdminRole.id,
      email,
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      status: UserStatus.ACTIVE,
    } as any);
    console.log('Super Admin user created successfully.');
  } else {
    console.log('Super Admin user already exists.');
  }

  await app.close();
}

bootstrap();
