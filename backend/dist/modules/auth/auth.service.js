"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_typescript_1 = require("sequelize-typescript");
const role_model_1 = require("../roles/models/role.model");
const user_model_1 = require("../users/models/user.model");
const organization_model_1 = require("../organizations/models/organization.model");
let AuthService = class AuthService {
    userModel;
    roleModel;
    organizationModel;
    sequelize;
    jwtService;
    configService;
    saltRounds = 10;
    constructor(userModel, roleModel, organizationModel, sequelize, jwtService, configService) {
        this.userModel = userModel;
        this.roleModel = roleModel;
        this.organizationModel = organizationModel;
        this.sequelize = sequelize;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(dto) {
        const existingUser = await this.userModel.findOne({
            where: { email: dto.email.toLowerCase() },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User email already registered');
        }
        const existingOrg = await this.organizationModel.findOne({
            where: { code: dto.organizationCode },
        });
        if (existingOrg) {
            throw new common_1.ConflictException('Organization code already exists');
        }
        const roleName = dto.role || role_model_1.RoleName.ADMIN;
        const role = await this.roleModel.findOne({
            where: { name: roleName },
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role ${roleName} not found`);
        }
        const hashedPassword = await bcrypt.hash(dto.password, this.saltRounds);
        const result = await this.sequelize.transaction(async (tx) => {
            const org = await this.organizationModel.create({
                name: dto.organizationName,
                code: dto.organizationCode,
                status: organization_model_1.OrganizationStatus.ACTIVE,
            }, { transaction: tx });
            const user = await this.userModel.create({
                organizationId: org.id,
                roleId: role.id,
                email: dto.email.toLowerCase(),
                password: hashedPassword,
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
                status: user_model_1.UserStatus.ACTIVE,
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
    async login(dto) {
        const user = await this.userModel.findOne({
            where: {
                email: dto.email.toLowerCase(),
            },
            include: [
                { model: role_model_1.Role, as: 'role' },
                { model: organization_model_1.Organization, as: 'organization' },
            ],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (user.status !== user_model_1.UserStatus.ACTIVE || user.organization.status !== organization_model_1.OrganizationStatus.ACTIVE) {
            throw new common_1.UnauthorizedException('User or organization account is deactivated');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const tokens = await this.generateTokens({
            sub: user.id,
            organizationId: user.organizationId,
            role: user.role.name,
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
                role: user.role.name,
            },
        };
    }
    async refresh(dto) {
        let payload;
        try {
            const refreshSecret = this.configService.get('jwt.refreshSecret') ||
                'super-secret-refresh-key-change-in-production-min-32-chars';
            payload = await this.jwtService.verifyAsync(dto.refreshToken, {
                secret: refreshSecret,
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        const user = await this.userModel.findOne({
            where: {
                id: payload.sub,
                organizationId: payload.organizationId,
            },
            include: [{ model: role_model_1.Role, as: 'role' }],
        });
        if (!user || !user.refreshToken) {
            throw new common_1.UnauthorizedException('Access denied');
        }
        const isRefreshTokenValid = await bcrypt.compare(dto.refreshToken, user.refreshToken);
        if (!isRefreshTokenValid) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        const tokens = await this.generateTokens({
            sub: user.id,
            organizationId: user.organizationId,
            role: user.role.name,
            email: user.email,
        });
        const newHashedRefreshToken = await bcrypt.hash(tokens.refreshToken, this.saltRounds);
        await user.update({ refreshToken: newHashedRefreshToken });
        return tokens;
    }
    async logout(userId, organizationId) {
        await this.userModel.update({ refreshToken: null }, {
            where: {
                id: userId,
                organizationId,
            },
        });
        return { message: 'Logged out successfully' };
    }
    async getMe(userId, organizationId) {
        const user = await this.userModel.findOne({
            where: {
                id: userId,
                organizationId,
            },
            attributes: ['id', 'email', 'firstName', 'lastName', 'phone', 'status', 'lastLoginAt', 'createdAt', 'updatedAt'],
            include: [
                {
                    model: organization_model_1.Organization,
                    as: 'organization',
                    attributes: ['id', 'name', 'code', 'status'],
                },
                {
                    model: role_model_1.Role,
                    as: 'role',
                    attributes: ['id', 'name', 'description'],
                },
            ],
        });
        if (!user) {
            throw new common_1.NotFoundException('User profile not found');
        }
        return user;
    }
    async changePassword(userId, organizationId, dto) {
        const user = await this.userModel.findOne({
            where: {
                id: userId,
                organizationId,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isOldPasswordCorrect = await bcrypt.compare(dto.oldPassword, user.password);
        if (!isOldPasswordCorrect) {
            throw new common_1.BadRequestException('Incorrect current password');
        }
        const hashedNewPassword = await bcrypt.hash(dto.newPassword, this.saltRounds);
        await user.update({
            password: hashedNewPassword,
            refreshToken: null,
        });
        return { message: 'Password updated successfully' };
    }
    async generateTokens(payload) {
        const accessSecret = this.configService.get('jwt.secret') ||
            'super-secret-jwt-key-change-in-production-min-32-chars';
        const refreshSecret = this.configService.get('jwt.refreshSecret') ||
            'super-secret-refresh-key-change-in-production-min-32-chars';
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: accessSecret,
            expiresIn: (this.configService.get('jwt.expiresIn') || '15m'),
        });
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: refreshSecret,
            expiresIn: (this.configService.get('jwt.refreshExpiresIn') || '7d'),
        });
        return { accessToken, refreshToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(user_model_1.User)),
    __param(1, (0, sequelize_1.InjectModel)(role_model_1.Role)),
    __param(2, (0, sequelize_1.InjectModel)(organization_model_1.Organization)),
    __metadata("design:paramtypes", [Object, Object, Object, sequelize_typescript_1.Sequelize,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map