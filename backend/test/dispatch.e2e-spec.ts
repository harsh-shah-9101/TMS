import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Dispatch API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const orgACode = `DSP-ORG-A-${Date.now()}`;
  const orgBCode = `DSP-ORG-B-${Date.now()}`;

  const emailA = `admin.dspa.${Date.now()}@tms.com`;
  const emailB = `admin.dspb.${Date.now()}@tms.com`;
  const password = 'Password123!';

  let tokenA: string;
  let tokenB: string;
  let tripIdA: string;
  let dispatchIdA: string;

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
        organizationName: 'Dispatch Org A',
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
        organizationName: 'Dispatch Org B',
        organizationCode: orgBCode,
        email: emailB,
        password: password,
        firstName: 'Admin',
        lastName: 'B',
      });
    tokenB = resB.body.accessToken;

    // Create a trip in Org A
    const tripRes = await request(app.getHttpServer())
      .post('/trips')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        tripNumber: 'TRIP-DSP-101',
      });
    tripIdA = tripRes.body.id;
  });

  afterAll(async () => {
    await prisma.dispatch.deleteMany({
      where: { dispatchNumber: 'DSP-1001' },
    });
    await prisma.trip.deleteMany({
      where: { tripNumber: 'TRIP-DSP-101' },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [emailA, emailB] } },
    });
    await prisma.organization.deleteMany({
      where: { code: { in: [orgACode, orgBCode] } },
    });
    await app.close();
  });

  it('POST /dispatch - Should create dispatch for trip in Org A', () => {
    return request(app.getHttpServer())
      .post('/dispatch')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        tripId: tripIdA,
        dispatchNumber: 'DSP-1001',
        gatePassNumber: 'GP-888',
        remarks: 'Cleared at gate 1',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.dispatchNumber).toBe('DSP-1001');
        expect(res.body.status).toBe('DISPATCHED');
        dispatchIdA = res.body.id;
      });
  });

  it('POST /dispatch - Should reject duplicate dispatch number in Org A', () => {
    return request(app.getHttpServer())
      .post('/dispatch')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        tripId: tripIdA,
        dispatchNumber: 'DSP-1001',
      })
      .expect(409);
  });

  it('GET /dispatch - Should list dispatches for authenticated organization', () => {
    return request(app.getHttpServer())
      .get('/dispatch')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBe(1);
      });
  });

  it('GET /dispatch/:id - Org B cannot fetch Org A dispatch (Isolation)', () => {
    return request(app.getHttpServer())
      .get(`/dispatch/${dispatchIdA}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
  });

  it('PATCH /dispatch/:id/status - Update dispatch status to GATE_OUT', () => {
    return request(app.getHttpServer())
      .patch(`/dispatch/${dispatchIdA}/status`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        status: 'GATE_OUT',
        remarks: 'Vehicle departed gate',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('GATE_OUT');
      });
  });
});
