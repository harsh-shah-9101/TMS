import { Model } from 'sequelize-typescript';
export declare class Customer extends Model<Customer> {
    id: string;
    organizationId: string;
    name: string;
    code: string;
    type: string;
    gstin: string | null;
    pan: string | null;
    email: string | null;
    phone: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
    status: string;
}
