import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('LR (Lorry Receipts) API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const orgACode = `LR-ORG-A-${Date.now()}`;
  const orgBCode = `LR-ORG-B-${Date.now()}`;

  const emailA = `admin.lra.${Date.now()}@tms.com`;
  const emailB = `admin.lrb.${Date.now()}@tms.com`;
  const password = 'Password123!';

  let tokenA: string;
  let tokenB: string;
  let shipmentIdA: string;
  let shipmentIdB: string;
  let lrIdA: string;

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
        organizationName: 'LR Org A',
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
        organizationName: 'LR Org B',
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
      .send({ name: 'Cust A', code: 'LR-CUST-A' });

    // Create Shipment for Org A
    const shipA = await request(app.getHttpServer())
      .post('/shipments')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        bookingNumber: 'LR-BK-A001',
        customerId: custA.body.id,
        originCity: 'Mumbai',
        destinationCity: 'Bengaluru',
      });
    shipmentIdA = shipA.body.id;

    // Create Customer & Shipment for Org B
    const custB = await request(app.getHttpServer())
      .post('/customers')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ name: 'Cust B', code: 'LR-CUST-B' });

    const shipB = await request(app.getHttpServer())
      .post('/shipments')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        bookingNumber: 'LR-BK-B001',
        customerId: custB.body.id,
        originCity: 'Delhi',
        destinationCity: 'Kolkata',
      });
    shipmentIdB = shipB.body.id;
  });

  afterAll(async () => {
    await prisma.lorryReceipt.deleteMany({
      where: { lrNumber: 'LR-2026-001' },
    });
    await prisma.shipment.deleteMany({
      where: { bookingNumber: { in: ['LR-BK-A001', 'LR-BK-B001'] } },
    });
    await prisma.customer.deleteMany({
      where: { code: { in: ['LR-CUST-A', 'LR-CUST-B'] } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [emailA, emailB] } },
    });
    await prisma.organization.deleteMany({
      where: { code: { in: [orgACode, orgBCode] } },
    });
    await app.close();
  });

  it('POST /lr - Should generate Lorry Receipt in Org A', () => {
    return request(app.getHttpServer())
      .post('/lr')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        shipmentId: shipmentIdA,
        lrNumber: 'LR-2026-001',
        consignorName: 'Reliance Ltd',
        consigneeName: 'TCS Ltd',
        freightTerms: 'TO_PAY',
        basicFreight: 40000,
        otherCharges: 2500,
        taxAmount: 2500,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.lrNumber).toBe('LR-2026-001');
        expect(res.body.totalAmount).toBe(45000);
        lrIdA = res.body.id;
      });
  });

  it('POST /lr - Should reject duplicate LR number in Org A', () => {
    return request(app.getHttpServer())
      .post('/lr')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        shipmentId: shipmentIdA,
        lrNumber: 'LR-2026-001',
        consignorName: 'Reliance Ltd',
        consigneeName: 'TCS Ltd',
      })
      .expect(409);
  });

  it('POST /lr - Org B can use same LR number LR-2026-001 (Multi-tenant isolation)', () => {
    return request(app.getHttpServer())
      .post('/lr')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        shipmentId: shipmentIdB,
        lrNumber: 'LR-2026-001',
        consignorName: 'Org B Consignor',
        consigneeName: 'Org B Consignee',
      })
      .expect(201);
  });

  it('GET /lr - Should list LRs for authenticated organization', () => {
    return request(app.getHttpServer())
      .get('/lr')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBe(1);
      });
  });

  it('GET /lr/:id - Org B cannot fetch Org A LR (Isolation)', () => {
    return request(app.getHttpServer())
      .get(`/lr/${lrIdA}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);
  });

  it('DELETE /lr/:id - Soft delete LR', () => {
    return request(app.getHttpServer())
      .delete(`/lr/${lrIdA}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toContain('deleted successfully');
      });
  });
});
