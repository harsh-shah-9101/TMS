import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Shipments & Bookings API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const orgACode = `SHIP-ORG-A-${Date.now()}`;
  const orgBCode = `SHIP-ORG-B-${Date.now()}`;

  const emailA = `admin.shipa.${Date.now()}@tms.com`;
  const emailB = `admin.shipb.${Date.now()}@tms.com`;
  const password = 'Password123!';

  let tokenA: string;
  let tokenB: string;
  let customerIdA: string;
  let customerIdB: string;
  let shipmentIdA: string;

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
        organizationName: 'Ship Org A',
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
        organizationName: 'Ship Org B',
        organizationCode: orgBCode,
        email: emailB,
        password: password,
        firstName: 'Admin',
        lastName: 'B',
      });
    tokenB = resB.body.accessToken;

    // Create Customer for Org A
    const custA = await request(app.getHttpServer())
      .post('/customers')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        name: 'Shipper Org A',
        code: 'SHIP-A001',
      });
    customerIdA = custA.body.id;

    // Create Customer for Org B
    const custB = await request(app.getHttpServer())
      .post('/customers')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        name: 'Shipper Org B',
        code: 'SHIP-B001',
      });
    customerIdB = custB.body.id;
  });

  afterAll(async () => {
    await prisma.shipmentItem.deleteMany({});
    await prisma.shipment.deleteMany({
      where: { bookingNumber: 'BK-2026-0001' },
    });
    await prisma.customer.deleteMany({
      where: { code: { in: ['SHIP-A001', 'SHIP-B001'] } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [emailA, emailB] } },
    });
    await prisma.organization.deleteMany({
      where: { code: { in: [orgACode, orgBCode] } },
    });
    await app.close();
  });

  it('POST /shipments - Should create shipment with items in Org A', () => {
    return request(app.getHttpServer())
      .post('/shipments')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        bookingNumber: 'BK-2026-0001',
        customerId: customerIdA,
        originCity: 'Mumbai',
        destinationCity: 'Bengaluru',
        freightAmount: 45000,
        items: [
          {
            description: 'Industrial Spare Parts',
            quantity: 5,
            weightKg: 250,
            volumeCuFt: 45,
          },
        ],
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.bookingNumber).toBe('BK-2026-0001');
        expect(res.body.status).toBe('CREATED');
        expect(res.body.items).toHaveLength(1);
        expect(res.body.totalWeightKg).toBe(1250);
        shipmentIdA = res.body.id;
      });
  });

  it('POST /shipments - Should reject duplicate booking number in Org A', () => {
    return request(app.getHttpServer())
      .post('/shipments')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        bookingNumber: 'BK-2026-0001',
        customerId: customerIdA,
        originCity: 'Mumbai',
        destinationCity: 'Bengaluru',
      })
      .expect(409);
  });

  it('POST /shipments - Org B can use same booking number (Multi-tenant isolation)', () => {
    return request(app.getHttpServer())
      .post('/shipments')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        bookingNumber: 'BK-2026-0001',
        customerId: customerIdB,
        originCity: 'Delhi',
        destinationCity: 'Kolkata',
      })
      .expect(201);
  });

  it('PATCH /shipments/:id/status - Should update valid transition (CREATED -> VALIDATED)', () => {
    return request(app.getHttpServer())
      .patch(`/shipments/${shipmentIdA}/status`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        status: 'VALIDATED',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('VALIDATED');
      });
  });

  it('PATCH /shipments/:id/status - Should reject invalid status transition (VALIDATED -> DELIVERED)', () => {
    return request(app.getHttpServer())
      .patch(`/shipments/${shipmentIdA}/status`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        status: 'DELIVERED',
      })
      .expect(400);
  });

  it('GET /shipments - Should list shipments for authenticated organization', () => {
    return request(app.getHttpServer())
      .get('/shipments')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBe(1);
      });
  });

  it('GET /shipments/:id - Org B cannot fetch Org A shipment (Isolation)', () => {
    return request(app.getHttpServer())
      .get(`/shipments/${shipmentIdA}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
  });

  it('DELETE /shipments/:id - Soft delete shipment', () => {
    return request(app.getHttpServer())
      .delete(`/shipments/${shipmentIdA}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toContain('deleted successfully');
      });
  });
});
