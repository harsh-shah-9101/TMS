import { Model } from 'sequelize-typescript';
import { Shipment } from '../../shipments/models/shipment.model';
export declare class LorryReceipt extends Model<LorryReceipt> {
    id: string;
    organizationId: string;
    shipmentId: string;
    lrNumber: string;
    lrDate: Date;
    consignorName: string;
    consignorAddress: string | null;
    consigneeName: string;
    consigneeAddress: string | null;
    freightTerms: string;
    basicFreight: number;
    otherCharges: number;
    taxAmount: number;
    totalAmount: number;
    remarks: string | null;
    status: string;
    shipment: Shipment;
}
