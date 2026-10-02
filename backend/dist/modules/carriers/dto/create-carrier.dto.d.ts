import { CarrierStatus } from '../../../common/enums';
export declare class CreateCarrierDto {
    name: string;
    code: string;
    gstin?: string;
    pan?: string;
    email?: string;
    phone?: string;
    addressLine1?: string;
    city?: string;
    state?: string;
    pincode?: string;
    rating?: number;
    status?: CarrierStatus;
}
