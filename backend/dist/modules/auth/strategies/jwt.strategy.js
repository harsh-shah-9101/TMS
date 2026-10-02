"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const sequelize_1 = require("@nestjs/sequelize");
const user_model_1 = require("../../users/models/user.model");
const organization_model_1 = require("../../organizations/models/organization.model");
const role_model_1 = require("../../roles/models/role.model");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    configService;
    userModel;
    constructor(configService, userModel) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('jwt.secret') || 'super-secret-jwt-key-change-in-production-min-32-chars',
        });
        this.configService = configService;
        this.userModel = userModel;
    }
    async validate(payload) {
        const user = await this.userModel.findOne({
            where: {
                id: payload.sub,
                organizationId: payload.organizationId,
            },
            include: [
                { model: role_model_1.Role, as: 'role' },
                { model: organization_model_1.Organization, as: 'organization' },
            ],
        });
        if (!user || user.status !== user_model_1.UserStatus.ACTIVE || user.organization.status !== organization_model_1.OrganizationStatus.ACTIVE) {
            throw new common_1.UnauthorizedException('User or organization is inactive or unauthorized');
        }
        return {
            userId: user.id,
            email: user.email,
            organizationId: user.organizationId,
            role: user.role.name,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, sequelize_1.InjectModel)(user_model_1.User)),
    __metadata("design:paramtypes", [config_1.ConfigService, Object])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map