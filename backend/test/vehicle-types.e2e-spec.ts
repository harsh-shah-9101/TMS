import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Vehicle Types API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const orgACode = `VT-ORG-A-${Date.now()}`;
  const orgBCode = `VT-ORG-B-${Date.now()}`;

  const emailA = `admin.orga.${Date.now()}@tms.com`;
  const emailB = `admin.orgb.${Date.now()}@tms.com`;
  const password = 'Password123!';

  let tokenA: string;
  let tokenB: string;
  let vehicleTypeIdA: string;

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
        organizationName: 'Fleet Org A',
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
        organizationName: 'Fleet Org B',
        organizationCode: orgBCode,
        email: emailB,
        password: password,
        firstName: 'Admin',
        lastName: 'B',
      });
    tokenB = resB.body.accessToken;
  });

  afterAll(async () => {
    await prisma.vehicleType.deleteMany({
      where: {
        code: { in: ['32MX', '14OT'] },
      },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [emailA, emailB] } },
    });
    await prisma.organization.deleteMany({
      where: { code: { in: [orgACode, orgBCode] } },
    });
    await app.close();
  });

  it('POST /vehicle-types - Should create vehicle type in Org A', () => {
    return request(app.getHttpServer())
      .post('/vehicle-types')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: '32ft Multi-Axle Container',
        code: '32MX',
        capacityTons: 15.5,
        volumeCuFt: 1850.0,
        axleCount: 3,
        fuelType: 'DIESEL',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.code).toBe('32MX');
        expect(res.body.capacityTons).toBe(15.5);
        vehicleTypeIdA = res.body.id;
      });
  });

  it('POST /vehicle-types - Should reject duplicate code in Org A', () => {
    return request(app.getHttpServer())
      .post('/vehicle-types')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'Duplicate 32ft Container',
        code: '32MX',
        capacityTons: 15.5,
      })
      .expect(409);
  });

  it('POST /vehicle-types - Org B can use same code 32MX (Multi-tenant isolation)', () => {
    return request(app.getHttpServer())
      .post('/vehicle-types')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        name: 'Org B 32ft Container',
        code: '32MX',
        capacityTons: 16.0,
      })
      .expect(201);
  });

  it('GET /vehicle-types - Should list vehicle types for authenticated organization', () => {
    return request(app.getHttpServer())
      .get('/vehicle-types')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBeGreaterThanOrEqual(1);
        expect(res.body.meta.total).toBe(1);
      });
  });

  it('GET /vehicle-types/:id - Org B cannot access Org A vehicle type (Isolation)', () => {
    return request(app.getHttpServer())
      .get(`/vehicle-types/${vehicleTypeIdA}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
  });

  it('PATCH /vehicle-types/:id - Org A updates vehicle type', () => {
    return request(app.getHttpServer())
      .patch(`/vehicle-types/${vehicleTypeIdA}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        capacityTons: 18.0,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.capacityTons).toBe(18.0);
      });
  });

  it('DELETE /vehicle-types/:id - Org A soft deletes vehicle type', () => {
    return request(app.getHttpServer())
      .delete(`/vehicle-types/${vehicleTypeIdA}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toContain('deleted successfully');
      });
  });

  it('GET /vehicle-types/:id - Soft deleted vehicle type returns 404', () => {
    return request(app.getHttpServer())
      .get(`/vehicle-types/${vehicleTypeIdA}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(404);
  });
});
