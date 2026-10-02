import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import * as bcrypt from 'bcrypt';

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('mocked_hash'),
    compare: vi.fn(),
  },
  hash: vi.fn().mockResolvedValue('mocked_hash'),
  compare: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: any;
  let jwtService: any;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'admin@demo-tms.com',
    password: 'hashedpassword',
    firstName: 'Admin',
    lastName: 'User',
    phone: '+1234567890',
    organizationId: 'org-uuid-1',
    status: 'ACTIVE',
    refreshToken: 'hashedrefreshtoken',
    role: { id: 'role-uuid-1', name: RoleName.ADMIN, description: 'Admin' },
    organization: { id: 'org-uuid-1', name: 'Demo Transport', code: 'DEMO', status: 'ACTIVE' },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    prismaService = {
      user: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      organization: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
      role: {
        findUnique: vi.fn(),
      },
      $transaction: vi.fn((cb) => cb(prismaService)),
    };

    jwtService = {
      signAsync: vi.fn().mockResolvedValue('mocked-token'),
      verifyAsync: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaService },
        { provide: JwtService, useValue: jwtService },
        {
          provide: ConfigService,
          useValue: {
            get: vi.fn((key: string) => {
              if (key === 'jwt.secret') return 'test-jwt-secret';
              if (key === 'jwt.refreshSecret') return 'test-jwt-refresh-secret';
              if (key === 'jwt.expiresIn') return '15m';
              if (key === 'jwt.refreshExpiresIn') return '7d';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if email already registered', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register({
          organizationName: 'New Org',
          organizationCode: 'NEW-ORG',
          email: 'admin@demo-tms.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if organization code already exists', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.organization.findUnique.mockResolvedValue({ id: 'org-1' });

      await expect(
        service.register({
          organizationName: 'Demo Transport',
          organizationCode: 'DEMO-TMS',
          email: 'new@demo-tms.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should successfully register organization and user', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.organization.findUnique.mockResolvedValue(null);
      prismaService.role.findUnique.mockResolvedValue({ id: 'role-1', name: RoleName.ADMIN });
      prismaService.organization.create.mockResolvedValue({ id: 'org-1', name: 'New Org', code: 'NEW' });
      prismaService.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'new@demo-tms.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: null,
        organizationId: 'org-1',
        role: { name: RoleName.ADMIN },
      });
      prismaService.user.update.mockResolvedValue({});

      const result = await service.register({
        organizationName: 'New Org',
        organizationCode: 'NEW',
        email: 'new@demo-tms.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('new@demo-tms.com');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException for invalid email', async () => {
      prismaService.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nonexistent@demo-tms.com', password: 'Password123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      prismaService.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(
        service.login({ email: 'admin@demo-tms.com', password: 'WrongPassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return tokens and user payload on successful login', async () => {
      prismaService.user.findFirst.mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true);
      prismaService.user.update.mockResolvedValue({});

      const result = await service.login({ email: 'admin@demo-tms.com', password: 'CorrectPassword' });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('admin@demo-tms.com');
    });
  });

  describe('logout', () => {
    it('should clear refresh token on logout', async () => {
      prismaService.user.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.logout('user-uuid-1', 'org-uuid-1');
      expect(result.message).toContain('Logged out');
      expect(prismaService.user.updateMany).toHaveBeenCalledWith({
        where: { id: 'user-uuid-1', organizationId: 'org-uuid-1' },
        data: { refreshToken: null },
      });
    });
  });
});
