import { DriverStatus } from '@prisma/client';
export declare class CreateDriverDto {
    firstName: string;
    lastName: string;
    phone: string;
    licenseNumber: string;
    licenseCategory?: string;
    licenseExpiry?: string;
    userId?: string;
    status?: DriverStatus;
}
