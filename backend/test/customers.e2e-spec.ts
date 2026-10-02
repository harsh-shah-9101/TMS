import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Customers & Parties API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const orgACode = `CUST-ORG-A-${Date.now()}`;
  const orgBCode = `CUST-ORG-B-${Date.now()}`;

  const emailA = `admin.custa.${Date.now()}@tms.com`;
  const emailB = `admin.custb.${Date.now()}@tms.com`;
  const password = 'Password123!';

  let tokenA: string;
  let tokenB: string;
  let customerIdA: string;

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
        organizationName: 'Cust Org A',
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
        organizationName: 'Cust Org B',
        organizationCode: orgBCode,
        email: emailB,
        password: password,
        firstName: 'Admin',
        lastName: 'B',
      });
    tokenB = resB.body.accessToken;
  });

  afterAll(async () => {
    await prisma.customer.deleteMany({
      where: { code: 'RIL001' },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [emailA, emailB] } },
    });
    await prisma.organization.deleteMany({
      where: { code: { in: [orgACode, orgBCode] } },
    });
    await app.close();
  });

  it('POST /customers - Should create customer in Org A', () => {
    return request(app.getHttpServer())
      .post('/customers')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'Reliance Industries Ltd',
        code: 'RIL001',
        type: 'BOTH',
        gstin: '27AAAAA0000A1Z5',
        email: 'logistics@ril.com',
        city: 'Mumbai',
        state: 'Maharashtra',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.code).toBe('RIL001');
        expect(res.body.gstin).toBe('27AAAAA0000A1Z5');
        customerIdA = res.body.id;
      });
  });

  it('POST /customers - Should reject duplicate customer code in Org A', () => {
    return request(app.getHttpServer())
      .post('/customers')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'Duplicate RIL',
        code: 'RIL001',
      })
      .expect(409);
  });

  it('POST /customers - Should reject invalid GSTIN format', () => {
    return request(app.getHttpServer())
      .post('/customers')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'Invalid GST Party',
        code: 'INV001',
        gstin: 'INVALID_GSTIN_FORMAT',
      })
      .expect(400);
  });

  it('POST /customers - Org B can create customer with same code RIL001 (Isolation)', () => {
    return request(app.getHttpServer())
      .post('/customers')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        name: 'Org B Reliance',
        code: 'RIL001',
      })
      .expect(201);
  });

  it('GET /customers - Should list customers for authenticated organization', () => {
    return request(app.getHttpServer())
      .get('/customers')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBe(1);
        expect(res.body.meta.total).toBe(1);
      });
  });

  it('GET /customers/:id - Org B cannot fetch Org A customer (Isolation)', () => {
    return request(app.getHttpServer())
      .get(`/customers/${customerIdA}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
  });

  it('PATCH /customers/:id - Update customer address and city', () => {
    return request(app.getHttpServer())
      .patch(`/customers/${customerIdA}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        city: 'Navi Mumbai',
        pincode: '400701',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.city).toBe('Navi Mumbai');
        expect(res.body.pincode).toBe('400701');
      });
  });

  it('DELETE /customers/:id - Soft delete customer', () => {
    return request(app.getHttpServer())
      .delete(`/customers/${customerIdA}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toContain('deleted successfully');
      });
  });

  it('GET /customers/:id - Soft deleted customer returns 404', () => {
    return request(app.getHttpServer())
      .get(`/customers/${customerIdA}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(404);
  });
});
