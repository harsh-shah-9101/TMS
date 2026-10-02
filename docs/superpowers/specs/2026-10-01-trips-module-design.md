# Trips Module (Module 19) Design Spec

## Objective
Migrate the Trips module from Prisma to Sequelize. Trips represent the core operational execution layer, linking routes, vehicles, drivers, carriers, and individual shipment stops.

## Database Design (Sequelize)

### 1. Trip Model (`trips` table)
- **Primary Key**: `id` (UUID)
- **Tenant Context**: `organizationId` (UUID)
- **Foreign Keys**: `routeId`, `vehicleId`, `driverId`, `carrierId`
- **Core Fields**:
  - `tripNumber` (String, unique within organization)
  - `status` (Enum: PLANNED, ASSIGNED, DISPATCHED, IN_TRANSIT, PAUSED, COMPLETED, CANCELLED)
  - `plannedStartDate`, `plannedEndDate` (DateTime)
  - `actualStartDate`, `actualEndDate` (DateTime)
  - `startOdometer`, `endOdometer` (Float)
  - `remarks` (String)
- **Timestamps**: `createdAt`, `updatedAt`, `deletedAt` (paranoid)

### 2. TripStop Model (`trip_stops` table)
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `tripId`, `shipmentId`
- **Core Fields**:
  - `sequence` (Integer)
  - `stopType` (Enum: PICKUP, DROPOFF, HALT, CHECKPOINT)
  - `locationName`, `city`, `pincode` (String)
  - `status` (Enum: PENDING, ARRIVED, COMPLETED, SKIPPED)
  - `arrivalTime`, `departureTime` (DateTime)
  - `remarks` (String)
- **Timestamps**: `createdAt`, `updatedAt` (No paranoid soft delete natively required, cascading delete on trip)

### 3. Associations
- `Trip` `hasMany` `TripStop` (`stops`)
- `TripStop` `belongsTo` `Trip`
- `Trip` `belongsTo` `Route`, `Vehicle`, `Driver`, `Carrier`
- `TripStop` `belongsTo` `Shipment`

## API & Business Logic
- **Transactional Updates**: Transitioning trip statuses automatically updates the assigned `Vehicle` and `Driver` statuses (e.g. to `ASSIGNED`, `IN_TRANSIT`, `AVAILABLE`).
- **Validation**: Enforce `organizationId` matching on route, vehicle, driver, carrier, and shipment before attaching them to a trip.
- **Nested Creation**: Allow trip stops to be passed inside the initial trip creation payload.
- **Error Handling**: `SequelizeUniqueConstraintError` for `tripNumber` converted to `409 Conflict`.
