import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Routes API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const orgACode = `RT-ORG-A-${Date.now()}`;
  const orgBCode = `RT-ORG-B-${Date.now()}`;

  const emailA = `admin.rta.${Date.now()}@tms.com`;
  const emailB = `admin.rtb.${Date.now()}@tms.com`;
  const password = 'Password123!';

  let tokenA: string;
  let tokenB: string;
  let routeIdA: string;

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
        organizationName: 'Route Org A',
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
        organizationName: 'Route Org B',
        organizationCode: orgBCode,
        email: emailB,
        password: password,
        firstName: 'Admin',
        lastName: 'B',
      });
    tokenB = resB.body.accessToken;
  });

  afterAll(async () => {
    await prisma.route.deleteMany({
      where: { code: 'RT-MUM-BLR' },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [emailA, emailB] } },
    });
    await prisma.organization.deleteMany({
      where: { code: { in: [orgACode, orgBCode] } },
    });
    await app.close();
  });

  it('POST /routes - Should create route in Org A', () => {
    return request(app.getHttpServer())
      .post('/routes')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'Mumbai to Bengaluru Express Corridor',
        code: 'RT-MUM-BLR',
        originCity: 'Mumbai',
        destinationCity: 'Bengaluru',
        distanceKm: 980.5,
        estimatedHours: 22.5,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.code).toBe('RT-MUM-BLR');
        expect(res.body.distanceKm).toBe(980.5);
        routeIdA = res.body.id;
      });
  });

  it('POST /routes - Should reject duplicate route code in Org A', () => {
    return request(app.getHttpServer())
      .post('/routes')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'Duplicate Route',
        code: 'RT-MUM-BLR',
        originCity: 'Mumbai',
        destinationCity: 'Bengaluru',
      })
      .expect(409);
  });

  it('POST /routes - Org B can create route with same code RT-MUM-BLR (Isolation)', () => {
    return request(app.getHttpServer())
      .post('/routes')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        name: 'Org B Mumbai to Bengaluru Route',
        code: 'RT-MUM-BLR',
        originCity: 'Mumbai',
        destinationCity: 'Bengaluru',
      })
      .expect(201);
  });

  it('GET /routes - Should list routes for authenticated organization', () => {
    return request(app.getHttpServer())
      .get('/routes')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBe(1);
      });
  });

  it('GET /routes/:id - Org B cannot fetch Org A route (Isolation)', () => {
    return request(app.getHttpServer())
      .get(`/routes/${routeIdA}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
  });

  it('PATCH /routes/:id - Update route distance and hours', () => {
    return request(app.getHttpServer())
      .patch(`/routes/${routeIdA}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        distanceKm: 995.0,
        estimatedHours: 21.0,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.distanceKm).toBe(995.0);
        expect(res.body.estimatedHours).toBe(21.0);
      });
  });

  it('DELETE /routes/:id - Soft delete route', () => {
    return request(app.getHttpServer())
      .delete(`/routes/${routeIdA}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toContain('deleted successfully');
      });
  });
});
