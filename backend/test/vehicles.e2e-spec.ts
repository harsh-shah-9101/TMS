import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Vehicles API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const orgACode = `VEH-ORG-A-${Date.now()}`;
  const orgBCode = `VEH-ORG-B-${Date.now()}`;

  const emailA = `admin.veha.${Date.now()}@tms.com`;
  const emailB = `admin.vehb.${Date.now()}@tms.com`;
  const password = 'Password123!';

  let tokenA: string;
  let tokenB: string;
  let vehicleTypeIdA: string;
  let vehicleTypeIdB: string;
  let vehicleIdA: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Register Org A
    const resA = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        organizationName: 'Veh Org A',
        organizationCode: orgACode,
        email: emailA,
        password: password,
        firstName: 'Admin',
        lastName: 'A',
      });
    tokenA = resA.body.accessToken;

    // Register Org B
    const resB = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        organizationName: 'Veh Org B',
        organizationCode: orgBCode,
        email: emailB,
        password: password,
        firstName: 'Admin',
        lastName: 'B',
      });
    tokenB = resB.body.accessToken;

    // Create VehicleType for Org A
    const vtA = await request(app.getHttpServer())
      .post('/vehicle-types')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: '32ft Container A',
        code: '32MX-A',
        capacityTons: 15.5,
      });
    vehicleTypeIdA = vtA.body.id;

    // Create VehicleType for Org B
    const vtB = await request(app.getHttpServer())
      .post('/vehicle-types')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        name: '32ft Container B',
        code: '32MX-B',
        capacityTons: 16.0,
      });
    vehicleTypeIdB = vtB.body.id;
  });

  afterAll(async () => {
    await prisma.vehicle.deleteMany({
      where: { registrationNumber: 'MH12AB1234' },
    });
    await prisma.vehicleType.deleteMany({
      where: { code: { in: ['32MX-A', '32MX-B'] } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [emailA, emailB] } },
    });
    await prisma.organization.deleteMany({
      where: { code: { in: [orgACode, orgBCode] } },
    });
    await app.close();
  });

  it('POST /vehicles - Should create vehicle in Org A', () => {
    return request(app.getHttpServer())
      .post('/vehicles')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        vehicleTypeId: vehicleTypeIdA,
        registrationNumber: 'MH 12 AB 1234',
        make: 'Tata Motors',
        model: 'Prima 5530.S',
        year: 2024,
        ownershipType: 'OWNED',
        currentOdometer: 5000,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.registrationNumber).toBe('MH12AB1234');
        expect(res.body.status).toBe('AVAILABLE');
        expect(res.body.vehicleType.id).toBe(vehicleTypeIdA);
        vehicleIdA = res.body.id;
      });
  });

  it('POST /vehicles - Should reject duplicate registration number in Org A', () => {
    return request(app.getHttpServer())
      .post('/vehicles')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        vehicleTypeId: vehicleTypeIdA,
        registrationNumber: 'MH12AB1234',
      })
      .expect(409);
  });

  it('POST /vehicles - Org A using Org B vehicleTypeId returns 400 Bad Request', () => {
    return request(app.getHttpServer())
      .post('/vehicles')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        vehicleTypeId: vehicleTypeIdB,
        registrationNumber: 'MH12AB9999',
      })
      .expect(400);
  });

  it('POST /vehicles - Org B can register same reg number (Multi-tenant isolation)', () => {
    return request(app.getHttpServer())
      .post('/vehicles')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        vehicleTypeId: vehicleTypeIdB,
        registrationNumber: 'MH12AB1234',
      })
      .expect(201);
  });

  it('GET /vehicles - Should list vehicles for authenticated organization', () => {
    return request(app.getHttpServer())
      .get('/vehicles')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBe(1);
        expect(res.body.meta.total).toBe(1);
      });
  });

  it('GET /vehicles/:id - Org B cannot fetch Org A vehicle (Isolation)', () => {
    return request(app.getHttpServer())
      .get(`/vehicles/${vehicleIdA}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
  });

  it('PATCH /vehicles/:id - Update status and current odometer', () => {
    return request(app.getHttpServer())
      .patch(`/vehicles/${vehicleIdA}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        status: 'ASSIGNED',
        currentOdometer: 5450.5,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ASSIGNED');
        expect(res.body.currentOdometer).toBe(5450.5);
      });
  });

  it('DELETE /vehicles/:id - Soft delete vehicle', () => {
    return request(app.getHttpServer())
      .delete(`/vehicles/${vehicleIdA}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toContain('deleted successfully');
      });
  });

  it('GET /vehicles/:id - Soft deleted vehicle returns 404', () => {
    return request(app.getHttpServer())
      .get(`/vehicles/${vehicleIdA}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(404);
  });
});
