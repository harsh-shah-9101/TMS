import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Auth System (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const testOrgCode = `E2E-ORG-${Date.now()}`;
  const testEmail = `e2e.admin.${Date.now()}@demo-tms.com`;
  const testPassword = 'InitialPassword123!';
  const newPassword = 'UpdatedPassword456!';

  let accessToken: string;
  let refreshToken: string;

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
  });

  afterAll(async () => {
    // Clean up test records
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
    await prisma.organization.deleteMany({
      where: { code: testOrgCode },
    });
    await app.close();
  });

  it('GET /health (Health check)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.database).toBe('connected');
      });
  });

  it('GET /auth/me without token should return 401 Unauthorized', () => {
    return request(app.getHttpServer())
      .get('/auth/me')
      .expect(401);
  });

  it('POST /auth/register - Register new organization and admin user', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        organizationName: 'E2E Logistics Ltd',
        organizationCode: testOrgCode,
        email: testEmail,
        password: testPassword,
        firstName: 'E2E',
        lastName: 'Admin',
        role: 'ADMIN',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('refreshToken');
        expect(res.body.user.email).toBe(testEmail);
        expect(res.body.user.role).toBe('ADMIN');

        accessToken = res.body.accessToken;
        refreshToken = res.body.refreshToken;
      });
  });

  it('POST /auth/register - Should reject duplicate email', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        organizationName: 'Another Logistics',
        organizationCode: `DIFF-CODE-${Date.now()}`,
        email: testEmail,
        password: testPassword,
        firstName: 'Duplicate',
        lastName: 'User',
      })
      .expect(409);
  });

  it('POST /auth/login - Should fail with wrong password', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testEmail,
        password: 'WrongPassword!',
      })
      .expect(401);
  });

  it('POST /auth/login - Should succeed with correct credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('refreshToken');
        expect(res.body.user.email).toBe(testEmail);

        accessToken = res.body.accessToken;
        refreshToken = res.body.refreshToken;
      });
  });

  it('GET /auth/me - Should return current user profile with valid Bearer token', () => {
    return request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe(testEmail);
        expect(res.body.organization.code).toBe(testOrgCode);
        expect(res.body.role.name).toBe('ADMIN');
      });
  });

  it('POST /auth/refresh - Should issue new access and refresh tokens', () => {
    return request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('refreshToken');

        accessToken = res.body.accessToken;
        refreshToken = res.body.refreshToken;
      });
  });

  it('POST /auth/change-password - Should change user password', () => {
    return request(app.getHttpServer())
      .post('/auth/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        oldPassword: testPassword,
        newPassword: newPassword,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toContain('updated successfully');
      });
  });

  it('POST /auth/login - Should login with new password', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testEmail,
        password: newPassword,
      })
      .expect(200)
      .expect((res) => {
        accessToken = res.body.accessToken;
        refreshToken = res.body.refreshToken;
      });
  });

  it('POST /auth/logout - Should logout user', () => {
    return request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toContain('Logged out successfully');
      });
  });
});
