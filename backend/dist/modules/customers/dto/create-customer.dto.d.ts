import { CustomerStatus, CustomerType } from '@prisma/client';
export declare class CreateCustomerDto {
    name: string;
    code: string;
    type?: CustomerType;
    gstin?: string;
    pan?: string;
    email?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    status?: CustomerStatus;
}
