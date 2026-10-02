# Tracking Events Module (Module 23) Design Spec

## Objective
Implement a system to capture discrete business events for vehicles or trips (e.g. Geofence entered/exited, Checkpost cleared). These are distinct from raw GPS pings (Module 22).

## Database Design (Sequelize)

### 1. TrackingEvent Model (`tracking_events` table)
- **Primary Key**: `id` (UUID)
- **Tenant Context**: `organizationId` (UUID)
- **Foreign Keys**: 
  - `tripId` (UUID, optional)
  - `vehicleId` (UUID, optional)
  - `driverId` (UUID, optional)
  - `shipmentId` (UUID, optional)
- **Core Fields**:
  - `eventType` (String - e.g. GEOFENCE_ENTER, GEOFENCE_EXIT, CHECKPOINT, TOLL_PLAZA)
  - `description` (String, optional)
  - `latitude` (Float, optional)
  - `longitude` (Float, optional)
  - `eventTime` (DateTime)
  - `metadata` (JSONB, for dynamic event payloads like toll cost, geofence ID)
  - `source` (String: SYSTEM, FASTAG, DRIVER_APP)
- **Timestamps**: `createdAt`

### 2. Associations
- `TrackingEvent` `belongsTo` `Trip`
- `TrackingEvent` `belongsTo` `Vehicle`

## API & Business Logic
- **Create**: Allow ingestion of tracking events with related entity IDs (Trip, Vehicle).
- **FindAll**: Query events filtering by `tripId`, `vehicleId`, or time range.
