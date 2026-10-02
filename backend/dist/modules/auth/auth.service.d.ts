import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize-typescript';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Role } from '../roles/models/role.model';
import { User } from '../users/models/user.model';
import { Organization } from '../organizations/models/organization.model';
export declare class AuthService {
    private userModel;
    private roleModel;
    private organizationModel;
    private sequelize;
    private jwtService;
    private configService;
    private readonly saltRounds;
    constructor(userModel: typeof User, roleModel: typeof Role, organizationModel: typeof Organization, sequelize: Sequelize, jwtService: JwtService, configService: ConfigService);
    register(dto: RegisterDto): Promise<AuthResponseDto>;
    login(dto: LoginDto): Promise<AuthResponseDto>;
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string, organizationId: string): Promise<{
        message: string;
    }>;
    getMe(userId: string, organizationId: string): Promise<User>;
    changePassword(userId: string, organizationId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    private generateTokens;
}
