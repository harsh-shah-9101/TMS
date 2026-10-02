import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Trips API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const orgACode = `TRIP-ORG-A-${Date.now()}`;
  const orgBCode = `TRIP-ORG-B-${Date.now()}`;

  const emailA = `admin.tripa.${Date.now()}@tms.com`;
  const emailB = `admin.tripb.${Date.now()}@tms.com`;
  const password = 'Password123!';

  let tokenA: string;
  let tokenB: string;
  let tripIdA: string;

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
        organizationName: 'Trip Org A',
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
        organizationName: 'Trip Org B',
        organizationCode: orgBCode,
        email: emailB,
        password: password,
        firstName: 'Admin',
        lastName: 'B',
      });
    tokenB = resB.body.accessToken;
  });

  afterAll(async () => {
    await prisma.tripStop.deleteMany({
      where: { locationName: { contains: 'Hub' } },
    });
    await prisma.trip.deleteMany({
      where: { tripNumber: 'TRIP-1001' },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [emailA, emailB] } },
    });
    await prisma.organization.deleteMany({
      where: { code: { in: [orgACode, orgBCode] } },
    });
    await app.close();
  });

  it('POST /trips - Should create trip with stops in Org A', () => {
    return request(app.getHttpServer())
      .post('/trips')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        tripNumber: 'TRIP-1001',
        startOdometer: 5000,
        remarks: 'First test trip',
        stops: [
          {
            sequence: 1,
            stopType: 'PICKUP',
            locationName: 'Mumbai Warehouse Hub',
            city: 'Mumbai',
          },
          {
            sequence: 2,
            stopType: 'DELIVERY',
            locationName: 'Bengaluru Distribution Hub',
            city: 'Bengaluru',
          },
        ],
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.tripNumber).toBe('TRIP-1001');
        expect(res.body.status).toBe('PLANNED');
        expect(res.body.stops).toHaveLength(2);
        tripIdA = res.body.id;
      });
  });

  it('POST /trips - Should reject duplicate trip number in Org A', () => {
    return request(app.getHttpServer())
      .post('/trips')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        tripNumber: 'TRIP-1001',
      })
      .expect(409);
  });

  it('POST /trips - Org B can create trip with same number TRIP-1001 (Isolation)', () => {
    return request(app.getHttpServer())
      .post('/trips')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        tripNumber: 'TRIP-1001',
      })
      .expect(201);
  });

  it('GET /trips - Should list trips for authenticated organization', () => {
    return request(app.getHttpServer())
      .get('/trips')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBe(1);
      });
  });

  it('GET /trips/:id - Org B cannot fetch Org A trip (Isolation)', () => {
    return request(app.getHttpServer())
      .get(`/trips/${tripIdA}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
  });

  it('PATCH /trips/:id/status - Update trip status to ASSIGNED', () => {
    return request(app.getHttpServer())
      .patch(`/trips/${tripIdA}/status`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        status: 'ASSIGNED',
        remarks: 'Assigned driver & vehicle',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ASSIGNED');
      });
  });

  it('DELETE /trips/:id - Soft delete trip', () => {
    return request(app.getHttpServer())
      .delete(`/trips/${tripIdA}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toContain('deleted successfully');
      });
  });
});
