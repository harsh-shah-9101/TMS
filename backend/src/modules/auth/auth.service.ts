import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Role, RoleName } from '../roles/models/role.model';
import { User, UserStatus } from '../users/models/user.model';
import { Organization, OrganizationStatus } from '../organizations/models/organization.model';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;

  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(Role) private roleModel: typeof Role,
    @InjectModel(Organization) private organizationModel: typeof Organization,
    private sequelize: Sequelize,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.userModel.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (existingUser) {
      throw new ConflictException('User email already registered');
    }

    const existingOrg = await this.organizationModel.findOne({
      where: { code: dto.organizationCode },
    });
    if (existingOrg) {
      throw new ConflictException('Organization code already exists');
    }

    const roleName = dto.role || RoleName.ADMIN;
    const role = await this.roleModel.findOne({
      where: { name: roleName },
    });

    if (!role) {
      throw new NotFoundException(`Role ${roleName} not found`);
    }

    const hashedPassword = await bcrypt.hash(dto.password, this.saltRounds);

    const result = await this.sequelize.transaction(async (tx) => {
      const org = await this.organizationModel.create({
        name: dto.organizationName,
        code: dto.organizationCode,
        status: OrganizationStatus.ACTIVE,
      }, { transaction: tx });

      const user = await this.userModel.create({
        organizationId: org.id,
        roleId: role.id,
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        status: UserStatus.ACTIVE,
        lastLoginAt: new Date(),
      }, { transaction: tx });

      return { org, user };
    });

    const tokens = await this.generateTokens({
      sub: result.user.id,
      organizationId: result.user.organizationId,
      role: role.name,
      email: result.user.email,
    });

    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, this.saltRounds);
    await result.user.update({ refreshToken: hashedRefreshToken });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        phone: result.user.phone,
        organizationId: result.user.organizationId,
        role: role.name,
      },
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userModel.findOne({
      where: {
        email: dto.email.toLowerCase(),
      },
      include: [
        { model: Role, as: 'role' },
        { model: Organization, as: 'organization' },
      ],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== UserStatus.ACTIVE || user.organization.status !== OrganizationStatus.ACTIVE) {
      throw new UnauthorizedException('User or organization account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      organizationId: user.organizationId,
      role: user.role.name as string,
      email: user.email,
    });

    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, this.saltRounds);

    await user.update({
      refreshToken: hashedRefreshToken,
      lastLoginAt: new Date(),
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        organizationId: user.organizationId,
        role: user.role.name as string,
      },
    };
  }

  async refresh(dto: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: JwtPayload;
    try {
      const refreshSecret =
        this.configService.get<string>('jwt.refreshSecret') ||
        'super-secret-refresh-key-change-in-production-min-32-chars';
      payload = await this.jwtService.verifyAsync<JwtPayload>(dto.refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userModel.findOne({
      where: {
        id: payload.sub,
        organizationId: payload.organizationId,
      },
      include: [{ model: Role, as: 'role' }],
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const isRefreshTokenValid = await bcrypt.compare(dto.refreshToken, user.refreshToken);
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      organizationId: user.organizationId,
      role: user.role.name as string,
      email: user.email,
    });

    const newHashedRefreshToken = await bcrypt.hash(tokens.refreshToken, this.saltRounds);
    await user.update({ refreshToken: newHashedRefreshToken });

    return tokens;
  }

  async logout(userId: string, organizationId: string): Promise<{ message: string }> {
    await this.userModel.update(
      { refreshToken: null },
      {
        where: {
          id: userId,
          organizationId,
        },
      },
    );
    return { message: 'Logged out successfully' };
  }

  async getMe(userId: string, organizationId: string) {
    const user = await this.userModel.findOne({
      where: {
        id: userId,
        organizationId,
      },
      attributes: ['id', 'email', 'firstName', 'lastName', 'phone', 'status', 'lastLoginAt', 'createdAt', 'updatedAt'],
      include: [
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'code', 'status'],
        },
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name', 'description'],
        },
      ],
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return user;
  }

  async changePassword(
    userId: string,
    organizationId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findOne({
      where: {
        id: userId,
        organizationId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isOldPasswordCorrect = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isOldPasswordCorrect) {
      throw new BadRequestException('Incorrect current password');
    }

    const hashedNewPassword = await bcrypt.hash(dto.newPassword, this.saltRounds);
    await user.update({
      password: hashedNewPassword,
      refreshToken: null,
    });

    return { message: 'Password updated successfully' };
  }

  private async generateTokens(payload: JwtPayload): Promise<{ accessToken: string; refreshToken: string }> {
    const accessSecret =
      this.configService.get<string>('jwt.secret') ||
      'super-secret-jwt-key-change-in-production-min-32-chars';
    const refreshSecret =
      this.configService.get<string>('jwt.refreshSecret') ||
      'super-secret-refresh-key-change-in-production-min-32-chars';

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessSecret,
      expiresIn: (this.configService.get<string>('jwt.expiresIn') || '15m') as any,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: (this.configService.get<string>('jwt.refreshExpiresIn') || '7d') as any,
    });

    return { accessToken, refreshToken };
  }
}
