import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Drivers API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const orgACode = `DRV-ORG-A-${Date.now()}`;
  const orgBCode = `DRV-ORG-B-${Date.now()}`;

  const emailA = `admin.drva.${Date.now()}@tms.com`;
  const emailB = `admin.drvb.${Date.now()}@tms.com`;
  const password = 'Password123!';

  let tokenA: string;
  let tokenB: string;
  let driverIdA: string;

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
        organizationName: 'Drv Org A',
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
        organizationName: 'Drv Org B',
        organizationCode: orgBCode,
        email: emailB,
        password: password,
        firstName: 'Admin',
        lastName: 'B',
      });
    tokenB = resB.body.accessToken;
  });

  afterAll(async () => {
    await prisma.driver.deleteMany({
      where: { licenseNumber: 'DL1420110012345' },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [emailA, emailB] } },
    });
    await prisma.organization.deleteMany({
      where: { code: { in: [orgACode, orgBCode] } },
    });
    await app.close();
  });

  it('POST /drivers - Should register driver in Org A', () => {
    return request(app.getHttpServer())
      .post('/drivers')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        firstName: 'Rahul',
        lastName: 'Sharma',
        phone: '+919876543210',
        licenseNumber: 'DL14 201100 12345',
        licenseCategory: 'HMV',
        licenseExpiry: '2028-12-31T00:00:00.000Z',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.licenseNumber).toBe('DL1420110012345');
        expect(res.body.status).toBe('AVAILABLE');
        driverIdA = res.body.id;
      });
  });

  it('POST /drivers - Should reject duplicate license number in Org A', () => {
    return request(app.getHttpServer())
      .post('/drivers')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        firstName: 'Duplicate',
        lastName: 'Driver',
        phone: '+919999999999',
        licenseNumber: 'DL1420110012345',
      })
      .expect(409);
  });

  it('POST /drivers - Org B can register driver with same license (Multi-tenant isolation)', () => {
    return request(app.getHttpServer())
      .post('/drivers')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        firstName: 'Org B',
        lastName: 'Driver',
        phone: '+918888888888',
        licenseNumber: 'DL1420110012345',
      })
      .expect(201);
  });

  it('GET /drivers - Should list drivers for authenticated organization', () => {
    return request(app.getHttpServer())
      .get('/drivers')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBe(1);
        expect(res.body.meta.total).toBe(1);
      });
  });

  it('GET /drivers/:id - Org B cannot fetch Org A driver (Isolation)', () => {
    return request(app.getHttpServer())
      .get(`/drivers/${driverIdA}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
  });

  it('PATCH /drivers/:id - Update driver status to ON_TRIP', () => {
    return request(app.getHttpServer())
      .patch(`/drivers/${driverIdA}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        status: 'ON_TRIP',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ON_TRIP');
      });
  });

  it('DELETE /drivers/:id - Soft delete driver', () => {
    return request(app.getHttpServer())
      .delete(`/drivers/${driverIdA}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toContain('deleted successfully');
      });
  });

  it('GET /drivers/:id - Soft deleted driver returns 404', () => {
    return request(app.getHttpServer())
      .get(`/drivers/${driverIdA}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(404);
  });
});
