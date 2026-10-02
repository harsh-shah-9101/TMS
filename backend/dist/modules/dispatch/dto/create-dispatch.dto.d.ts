import { DispatchStatus } from '@prisma/client';
export declare class CreateDispatchDto {
    tripId: string;
    dispatchNumber: string;
    gatePassNumber?: string;
    status?: DispatchStatus;
    remarks?: string;
}
