import { RoleName } from '@prisma/client';
export declare class RegisterDto {
    organizationName: string;
    organizationCode: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: RoleName;
}
