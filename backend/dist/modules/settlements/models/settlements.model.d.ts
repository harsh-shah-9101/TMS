import { Model } from 'sequelize-typescript';
import { Driver } from '../../drivers/models/driver.model';
import { Carrier } from '../../carriers/models/carrier.model';
export declare class Settlement extends Model<Settlement> {
    id: string;
    organizationId: string;
    driverId: string | null;
    carrierId: string | null;
    amount: number;
    status: string;
    driver: Driver;
    carrier: Carrier;
}
