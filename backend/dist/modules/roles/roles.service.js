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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const role_model_1 = require("./models/role.model");
let RolesService = class RolesService {
    roleModel;
    constructor(roleModel) {
        this.roleModel = roleModel;
    }
    async onModuleInit() {
        await this.seedDefaultRoles();
    }
    async seedDefaultRoles() {
        const roles = [
            { name: role_model_1.RoleName.SUPER_ADMIN, description: 'Super Administrator with global platform rights' },
            { name: role_model_1.RoleName.ADMIN, description: 'Organization Administrator' },
            { name: role_model_1.RoleName.TRANSPORT_MANAGER, description: 'Manages transport bookings, shipments, and trips' },
            { name: role_model_1.RoleName.DISPATCHER, description: 'Manages vehicle dispatch and trip execution' },
            { name: role_model_1.RoleName.FLEET_MANAGER, description: 'Manages vehicles, maintenance, and fuel operations' },
            { name: role_model_1.RoleName.ACCOUNTS, description: 'Manages billing, settlements, and advances' },
            { name: role_model_1.RoleName.DRIVER, description: 'Executes trips and reports status' },
            { name: role_model_1.RoleName.VIEWER, description: 'Read-only access to organization operations' },
        ];
        for (const roleData of roles) {
            const [role, created] = await this.roleModel.findOrCreate({
                where: { name: roleData.name },
                defaults: roleData,
            });
            if (!created) {
                await role.update(roleData);
            }
        }
    }
    async findByName(name) {
        return this.roleModel.findOne({
            where: { name },
        });
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(role_model_1.Role)),
    __metadata("design:paramtypes", [Object])
], RolesService);
//# sourceMappingURL=roles.service.js.map