export declare class CreateTrackingEventDto {
    eventType: string;
    tripId?: string;
    vehicleId?: string;
    driverId?: string;
    shipmentId?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    eventTime: string;
    metadata?: any;
    source?: string;
}
