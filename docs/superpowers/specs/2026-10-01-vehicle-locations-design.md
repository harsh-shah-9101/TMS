# Vehicle Locations Module (Module 22) Design Spec

## Objective
Implement tracking of vehicle physical coordinates. This module records time-series location data, which is essential for live tracking and calculating distance traveled.

## Database Design (Sequelize)

### 1. VehicleLocation Model (`vehicle_locations` table)
- **Primary Key**: `id` (UUID)
- **Tenant Context**: `organizationId` (UUID)
- **Foreign Keys**: `vehicleId` (UUID)
- **Core Fields**:
  - `latitude` (Float)
  - `longitude` (Float)
  - `speed` (Float, optional, km/h)
  - `heading` (Float, optional, degrees 0-360)
  - `recordedAt` (DateTime, exact time of GPS ping)
  - `source` (String: 'GPS_DEVICE', 'DRIVER_APP', 'MANUAL')
- **Timestamps**: `createdAt` (System ingestion time)
- **Indexes**: 
  - `organizationId`
  - `vehicleId`
  - `recordedAt` (for fast time-series queries)

### 2. Associations
- `VehicleLocation` `belongsTo` `Vehicle`

## API & Business Logic
- **Ingestion (Create)**:
  - Takes vehicle ID, latitude, longitude, and optional telemetry.
  - Automatically associates with the active Trip if necessary (handled by tracking events, but core ingestion is here).
- **Query (Find)**:
  - Ability to fetch the latest known location for a vehicle.
  - Ability to fetch location history for a vehicle over a given time range.
