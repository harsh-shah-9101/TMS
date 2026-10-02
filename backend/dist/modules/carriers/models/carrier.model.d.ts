import { Model } from 'sequelize-typescript';
export declare class Carrier extends Model<Carrier> {
    id: string;
    organizationId: string;
    name: string;
    code: string;
    gstin: string | null;
    pan: string | null;
    email: string | null;
    phone: string | null;
    addressLine1: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
    rating: number | null;
    status: string;
}
