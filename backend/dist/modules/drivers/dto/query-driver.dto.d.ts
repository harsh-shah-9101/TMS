import { DriverStatus } from '../../../common/enums';
export declare class QueryDriverDto {
    search?: string;
    status?: DriverStatus;
    page?: number;
    limit?: number;
}
