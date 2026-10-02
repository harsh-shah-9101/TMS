import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/sequelize';
import { User, UserStatus } from './modules/users/models/user.model';
import { Organization, OrganizationStatus } from './modules/organizations/models/organization.model';
import { Role, RoleName } from './modules/roles/models/role.model';
import { VehicleType } from './modules/vehicle-types/models/vehicle-types.model';
import { Vehicle } from './modules/vehicles/models/vehicle.model';
import { Driver } from './modules/drivers/models/driver.model';
import { Customer } from './modules/customers/models/customer.model';
import { Carrier } from './modules/carriers/models/carrier.model';
import { Route } from './modules/routes/models/route.model';
import * as bcrypt from 'bcrypt';
import { CustomerType } from './common/enums';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const orgModel = app.get<typeof Organization>(getModelToken(Organization));
  const userModel = app.get<typeof User>(getModelToken(User));
  const roleModel = app.get<typeof Role>(getModelToken(Role));
  const vtModel = app.get<typeof VehicleType>(getModelToken(VehicleType));
  const vehicleModel = app.get<typeof Vehicle>(getModelToken(Vehicle));
  const driverModel = app.get<typeof Driver>(getModelToken(Driver));
  const customerModel = app.get<typeof Customer>(getModelToken(Customer));
  const carrierModel = app.get<typeof Carrier>(getModelToken(Carrier));
  const routeModel = app.get<typeof Route>(getModelToken(Route));

  console.log('Seeding Company Data...');

  // 1. Create Organization
  let org = await orgModel.findOne({ where: { code: 'FAST_TRK' } });
  if (!org) {
    org = await orgModel.create({
      name: 'FastTrack Logistics Ltd',
      code: 'FAST_TRK',
      status: OrganizationStatus.ACTIVE,
    } as any);
  }

  // 2. Create Admin User
  const adminRole = await roleModel.findOne({ where: { name: RoleName.ADMIN } });
  const email = 'admin@fasttrack.com';
  let user = await userModel.findOne({ where: { email } });
  if (!user) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    user = await userModel.create({
      organizationId: org.id,
      roleId: adminRole!.id,
      email,
      password: hashedPassword,
      firstName: 'Rahul',
      lastName: 'Sharma',
      status: UserStatus.ACTIVE,
    } as any);
  }

  // 3. Create Vehicle Types
  const types = [
    { name: 'Open Truck 10T', code: 'OT-10T', capacityTons: 10 },
    { name: 'Closed Container 14T', code: 'CC-14T', capacityTons: 14 }
  ];
  const createdVTs = [];
  for (const t of types) {
    let vt = await vtModel.findOne({ where: { name: t.name, organizationId: org.id } });
    if (!vt) {
      vt = await vtModel.create({ organizationId: org.id, name: t.name, code: t.code, capacityTons: t.capacityTons } as any);
    }
    createdVTs.push(vt);
  }

  // 4. Create Vehicles
  const vehicles = [
    { reg: 'MH-04-AB-1234', vt: createdVTs[0].id, make: 'Tata', status: 'AVAILABLE' },
    { reg: 'MH-12-CD-9090', vt: createdVTs[1].id, make: 'Ashok Leyland', status: 'IN_TRANSIT' },
    { reg: 'KA-01-EE-5566', vt: createdVTs[0].id, make: 'Mahindra', status: 'MAINTENANCE' },
    { reg: 'DL-09-FF-7788', vt: createdVTs[1].id, make: 'Eicher', status: 'AVAILABLE' },
  ];
  for (const v of vehicles) {
    let veh = await vehicleModel.findOne({ where: { registrationNumber: v.reg, organizationId: org.id } });
    if (!veh) {
      await vehicleModel.create({ organizationId: org.id, vehicleTypeId: v.vt, registrationNumber: v.reg, make: v.make, status: v.status } as any);
    }
  }

  // 5. Create Drivers
  const drivers = [
    { name: 'Ramesh Kumar', mobile: '9876543210', license: 'DL-12345678', status: 'AVAILABLE' },
    { name: 'Suresh Singh', mobile: '8765432109', license: 'DL-87654321', status: 'ON_TRIP' },
    { name: 'Abdul Khan', mobile: '7654321098', license: 'DL-11223344', status: 'ON_LEAVE' },
  ];
  for (const d of drivers) {
    let drv = await driverModel.findOne({ where: { phone: d.mobile, organizationId: org.id } });
    if (!drv) {
      await driverModel.create({ organizationId: org.id, firstName: d.name.split(' ')[0], lastName: d.name.split(' ')[1], phone: d.mobile, licenseNumber: d.license, status: d.status } as any);
    }
  }

  // 6. Create Customers (Parties)
  const customers = [
    { name: 'Tata Steel', type: CustomerType.CORPORATE, gstin: '27AADCT1234E1Z1' },
    { name: 'Reliance Industries', type: CustomerType.CORPORATE, gstin: '27AAACR1234F1Z1' },
    { name: 'Maruti Suzuki', type: CustomerType.CORPORATE, gstin: '06AAACM1234G1Z1' }
  ];
  for (const c of customers) {
    let cust = await customerModel.findOne({ where: { name: c.name, organizationId: org.id } });
    if (!cust) {
      await customerModel.create({ organizationId: org.id, name: c.name, customerType: c.type, gstin: c.gstin } as any);
    }
  }

  // 7. Create Carriers
  const carriers = [
    { name: 'BlueDart Freight', gstin: '27AAACB1234H1Z1', status: 'ACTIVE' },
    { name: 'VRL Logistics', gstin: '29AAACV1234I1Z1', status: 'ACTIVE' }
  ];
  for (const c of carriers) {
    let car = await carrierModel.findOne({ where: { name: c.name, organizationId: org.id } });
    if (!car) {
      await carrierModel.create({ organizationId: org.id, name: c.name, gstin: c.gstin, status: c.status } as any);
    }
  }

  // 8. Create Routes
  const routes = [
    { name: 'Mumbai - Delhi', origin: 'Mumbai', destination: 'Delhi', dist: 1400 },
    { name: 'Bangalore - Chennai', origin: 'Bangalore', destination: 'Chennai', dist: 350 },
    { name: 'Pune - Ahmedabad', origin: 'Pune', destination: 'Ahmedabad', dist: 660 }
  ];
  for (const r of routes) {
    let rt = await routeModel.findOne({ where: { name: r.name, organizationId: org.id } });
    if (!rt) {
      await routeModel.create({ organizationId: org.id, name: r.name, origin: r.origin, destination: r.destination, estimatedDistance: r.dist } as any);
    }
  }

  console.log('Company Seed Data inserted successfully!');
  await app.close();
}

bootstrap();
