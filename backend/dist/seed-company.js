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
const vehicle_types_model_1 = require("./modules/vehicle-types/models/vehicle-types.model");
const vehicle_model_1 = require("./modules/vehicles/models/vehicle.model");
const driver_model_1 = require("./modules/drivers/models/driver.model");
const customer_model_1 = require("./modules/customers/models/customer.model");
const carrier_model_1 = require("./modules/carriers/models/carrier.model");
const route_model_1 = require("./modules/routes/models/route.model");
const bcrypt = __importStar(require("bcrypt"));
const enums_1 = require("./common/enums");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const orgModel = app.get((0, sequelize_1.getModelToken)(organization_model_1.Organization));
    const userModel = app.get((0, sequelize_1.getModelToken)(user_model_1.User));
    const roleModel = app.get((0, sequelize_1.getModelToken)(role_model_1.Role));
    const vtModel = app.get((0, sequelize_1.getModelToken)(vehicle_types_model_1.VehicleType));
    const vehicleModel = app.get((0, sequelize_1.getModelToken)(vehicle_model_1.Vehicle));
    const driverModel = app.get((0, sequelize_1.getModelToken)(driver_model_1.Driver));
    const customerModel = app.get((0, sequelize_1.getModelToken)(customer_model_1.Customer));
    const carrierModel = app.get((0, sequelize_1.getModelToken)(carrier_model_1.Carrier));
    const routeModel = app.get((0, sequelize_1.getModelToken)(route_model_1.Route));
    console.log('Seeding Company Data...');
    let org = await orgModel.findOne({ where: { code: 'FAST_TRK' } });
    if (!org) {
        org = await orgModel.create({
            name: 'FastTrack Logistics Ltd',
            code: 'FAST_TRK',
            status: organization_model_1.OrganizationStatus.ACTIVE,
        });
    }
    const adminRole = await roleModel.findOne({ where: { name: role_model_1.RoleName.ADMIN } });
    const email = 'admin@fasttrack.com';
    let user = await userModel.findOne({ where: { email } });
    if (!user) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        user = await userModel.create({
            organizationId: org.id,
            roleId: adminRole.id,
            email,
            password: hashedPassword,
            firstName: 'Rahul',
            lastName: 'Sharma',
            status: user_model_1.UserStatus.ACTIVE,
        });
    }
    const types = [
        { name: 'Open Truck 10T', code: 'OT-10T', capacityTons: 10 },
        { name: 'Closed Container 14T', code: 'CC-14T', capacityTons: 14 }
    ];
    const createdVTs = [];
    for (const t of types) {
        let vt = await vtModel.findOne({ where: { name: t.name, organizationId: org.id } });
        if (!vt) {
            vt = await vtModel.create({ organizationId: org.id, name: t.name, code: t.code, capacityTons: t.capacityTons });
        }
        createdVTs.push(vt);
    }
    const vehicles = [
        { reg: 'MH-04-AB-1234', vt: createdVTs[0].id, make: 'Tata', status: 'AVAILABLE' },
        { reg: 'MH-12-CD-9090', vt: createdVTs[1].id, make: 'Ashok Leyland', status: 'IN_TRANSIT' },
        { reg: 'KA-01-EE-5566', vt: createdVTs[0].id, make: 'Mahindra', status: 'MAINTENANCE' },
        { reg: 'DL-09-FF-7788', vt: createdVTs[1].id, make: 'Eicher', status: 'AVAILABLE' },
    ];
    for (const v of vehicles) {
        let veh = await vehicleModel.findOne({ where: { registrationNumber: v.reg, organizationId: org.id } });
        if (!veh) {
            await vehicleModel.create({ organizationId: org.id, vehicleTypeId: v.vt, registrationNumber: v.reg, make: v.make, status: v.status });
        }
    }
    const drivers = [
        { name: 'Ramesh Kumar', mobile: '9876543210', license: 'DL-12345678', status: 'AVAILABLE' },
        { name: 'Suresh Singh', mobile: '8765432109', license: 'DL-87654321', status: 'ON_TRIP' },
        { name: 'Abdul Khan', mobile: '7654321098', license: 'DL-11223344', status: 'ON_LEAVE' },
    ];
    for (const d of drivers) {
        let drv = await driverModel.findOne({ where: { phone: d.mobile, organizationId: org.id } });
        if (!drv) {
            await driverModel.create({ organizationId: org.id, firstName: d.name.split(' ')[0], lastName: d.name.split(' ')[1], phone: d.mobile, licenseNumber: d.license, status: d.status });
        }
    }
    const customers = [
        { name: 'Tata Steel', type: enums_1.CustomerType.SHIPPER, gstin: '27AADCT1234E1Z1' },
        { name: 'Reliance Industries', type: enums_1.CustomerType.SHIPPER, gstin: '27AAACR1234F1Z1' },
        { name: 'Maruti Suzuki', type: enums_1.CustomerType.SHIPPER, gstin: '06AAACM1234G1Z1' }
    ];
    for (const c of customers) {
        let cust = await customerModel.findOne({ where: { name: c.name, organizationId: org.id } });
        if (!cust) {
            await customerModel.create({ organizationId: org.id, name: c.name, customerType: c.type, gstin: c.gstin });
        }
    }
    const carriers = [
        { name: 'BlueDart Freight', gstin: '27AAACB1234H1Z1', status: 'ACTIVE' },
        { name: 'VRL Logistics', gstin: '29AAACV1234I1Z1', status: 'ACTIVE' }
    ];
    for (const c of carriers) {
        let car = await carrierModel.findOne({ where: { name: c.name, organizationId: org.id } });
        if (!car) {
            await carrierModel.create({ organizationId: org.id, name: c.name, gstin: c.gstin, status: c.status });
        }
    }
    const routes = [
        { name: 'Mumbai - Delhi', origin: 'Mumbai', destination: 'Delhi', dist: 1400 },
        { name: 'Bangalore - Chennai', origin: 'Bangalore', destination: 'Chennai', dist: 350 },
        { name: 'Pune - Ahmedabad', origin: 'Pune', destination: 'Ahmedabad', dist: 660 }
    ];
    for (const r of routes) {
        let rt = await routeModel.findOne({ where: { name: r.name, organizationId: org.id } });
        if (!rt) {
            await routeModel.create({ organizationId: org.id, name: r.name, origin: r.origin, destination: r.destination, estimatedDistance: r.dist });
        }
    }
    console.log('Company Seed Data inserted successfully!');
    await app.close();
}
bootstrap();
//# sourceMappingURL=seed-company.js.map