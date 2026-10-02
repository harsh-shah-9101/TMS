import { Model } from 'sequelize-typescript';
export declare class Invoice extends Model<Invoice> {
    id: string;
    organizationId: string;
    customerId: string;
    amount: number;
    status: string;
    dueDate: Date;
}
