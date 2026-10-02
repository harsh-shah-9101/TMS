import { DispatchStatus } from '../../../common/enums';
export declare class CreateDispatchDto {
    tripId: string;
    dispatchNumber: string;
    gatePassNumber?: string;
    status?: DispatchStatus;
    remarks?: string;
}
