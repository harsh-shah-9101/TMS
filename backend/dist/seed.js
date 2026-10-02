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
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const sequelize_1 = require("@nestjs/sequelize");
const user_model_1 = require("./modules/users/models/user.model");
const organization_model_1 = require("./modules/organizations/models/organization.model");
const role_model_1 = require("./modules/roles/models/role.model");
const bcrypt = __importStar(require("bcrypt"));
const enums_1 = require("./common/enums");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const userModel = app.get((0, sequelize_1.getModelToken)(user_model_1.User));
    const orgModel = app.get((0, sequelize_1.getModelToken)(organization_model_1.Organization));
    const roleModel = app.get((0, sequelize_1.getModelToken)(role_model_1.Role));
    console.log('Seeding Super Admin...');
    const superAdminRole = await roleModel.findOne({ where: { name: role_model_1.RoleName.SUPER_ADMIN } });
    if (!superAdminRole) {
        console.error('Super Admin role not found. Ensure RolesService has seeded it.');
        process.exit(1);
    }
    const orgParams = {
        name: 'Super Admin Organization',
        code: 'SA_ORG',
        status: organization_model_1.OrganizationStatus.ACTIVE,
    };
    let org = await orgModel.findOne({ where: { code: 'SA_ORG' } });
    if (!org) {
        org = await orgModel.create(orgParams);
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
            status: enums_1.UserStatus.ACTIVE,
        });
        console.log('Super Admin user created successfully.');
    }
    else {
        console.log('Super Admin user already exists.');
    }
    await app.close();
}
bootstrap();
//# sourceMappingURL=seed.js.map