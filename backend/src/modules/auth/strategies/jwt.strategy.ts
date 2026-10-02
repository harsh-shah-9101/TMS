import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { RoleName } from '../../roles/models/role.model';
import { User, UserStatus } from '../../users/models/user.model';
import { Organization, OrganizationStatus } from '../../organizations/models/organization.model';
import { Role } from '../../roles/models/role.model';

export interface JwtPayload {
  sub: string;
  organizationId: string;
  role: string | RoleName;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectModel(User) private userModel: typeof User,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'super-secret-jwt-key-change-in-production-min-32-chars',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userModel.findOne({
      where: {
        id: payload.sub,
        organizationId: payload.organizationId,
      },
      include: [
        { model: Role, as: 'role' },
        { model: Organization, as: 'organization' },
      ],
    });

    if (!user || user.status !== UserStatus.ACTIVE || user.organization.status !== OrganizationStatus.ACTIVE) {
      throw new UnauthorizedException('User or organization is inactive or unauthorized');
    }

    return {
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role.name,
    };
  }
}
