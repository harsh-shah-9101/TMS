import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesModule } from '../roles/roles.module';
import { User } from '../users/models/user.model';
import { Role } from '../roles/models/role.model';
import { Organization } from '../organizations/models/organization.model';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Role, Organization]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    RolesModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
