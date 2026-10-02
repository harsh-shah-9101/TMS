import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Carriers & Transporters API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const orgACode = `CARR-ORG-A-${Date.now()}`;
  const orgBCode = `CARR-ORG-B-${Date.now()}`;

  const emailA = `admin.carra.${Date.now()}@tms.com`;
  const emailB = `admin.carrb.${Date.now()}@tms.com`;
  const password = 'Password123!';

  let tokenA: string;
  let tokenB: string;
  let carrierIdA: string;

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
        organizationName: 'Carr Org A',
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
        organizationName: 'Carr Org B',
        organizationCode: orgBCode,
        email: emailB,
        password: password,
        firstName: 'Admin',
        lastName: 'B',
      });
    tokenB = resB.body.accessToken;
  });

  afterAll(async () => {
    await prisma.carrier.deleteMany({
      where: { code: 'VRL001' },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [emailA, emailB] } },
    });
    await prisma.organization.deleteMany({
      where: { code: { in: [orgACode, orgBCode] } },
    });
    await app.close();
  });

  it('POST /carriers - Should create carrier in Org A', () => {
    return request(app.getHttpServer())
      .post('/carriers')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'VRL Logistics Ltd',
        code: 'VRL001',
        gstin: '29AAAAA0000A1Z5',
        email: 'ops@vrllogistics.com',
        city: 'Hubballi',
        rating: 4.8,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.code).toBe('VRL001');
        expect(res.body.gstin).toBe('29AAAAA0000A1Z5');
        expect(res.body.rating).toBe(4.8);
        carrierIdA = res.body.id;
      });
  });

  it('POST /carriers - Should reject duplicate carrier code in Org A', () => {
    return request(app.getHttpServer())
      .post('/carriers')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'Duplicate VRL',
        code: 'VRL001',
      })
      .expect(409);
  });

  it('POST /carriers - Should reject invalid GSTIN format', () => {
    return request(app.getHttpServer())
      .post('/carriers')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'Invalid GST Carrier',
        code: 'INV002',
        gstin: 'INVALID_GSTIN_FORMAT',
      })
      .expect(400);
  });

  it('POST /carriers - Org B can create carrier with same code VRL001 (Isolation)', () => {
    return request(app.getHttpServer())
      .post('/carriers')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        name: 'Org B VRL Transporter',
        code: 'VRL001',
      })
      .expect(201);
  });

  it('GET /carriers - Should list carriers for authenticated organization', () => {
    return request(app.getHttpServer())
      .get('/carriers')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBe(1);
        expect(res.body.meta.total).toBe(1);
      });
  });

  it('GET /carriers/:id - Org B cannot fetch Org A carrier (Isolation)', () => {
    return request(app.getHttpServer())
      .get(`/carriers/${carrierIdA}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
  });

  it('PATCH /carriers/:id - Update carrier rating and status', () => {
    return request(app.getHttpServer())
      .patch(`/carriers/${carrierIdA}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        rating: 4.9,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.rating).toBe(4.9);
      });
  });

  it('DELETE /carriers/:id - Soft delete carrier', () => {
    return request(app.getHttpServer())
      .delete(`/carriers/${carrierIdA}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toContain('deleted successfully');
      });
  });

  it('GET /carriers/:id - Soft deleted carrier returns 404', () => {
    return request(app.getHttpServer())
      .get(`/carriers/${carrierIdA}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(404);
  });
});
