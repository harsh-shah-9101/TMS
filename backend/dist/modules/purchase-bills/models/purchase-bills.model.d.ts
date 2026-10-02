import { Model } from 'sequelize-typescript';
import { Carrier } from '../../carriers/models/carrier.model';
export declare class PurchaseBill extends Model<PurchaseBill> {
    id: string;
    organizationId: string;
    carrierId: string | null;
    amount: number;
    status: string;
    dueDate: Date | null;
    carrier: Carrier;
}
