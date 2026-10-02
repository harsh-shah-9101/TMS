# Dispatch Module (Module 21) Design Spec

## Objective
Migrate the Dispatch module from Prisma to Sequelize. The Dispatch module handles the physical authorization (e.g. gate passes) of vehicles leaving a facility for an assigned Trip.

## Database Design (Sequelize)

### 1. Dispatch Model (`dispatches` table)
- **Primary Key**: `id` (UUID)
- **Tenant Context**: `organizationId` (UUID)
- **Foreign Keys**: `tripId` (UUID)
- **Core Fields**:
  - `dispatchNumber` (String, unique per org)
  - `gatePassNumber` (String, optional)
  - `status` (Enum: DISPATCHED, GATE_OUT, CANCELLED)
  - `dispatchedAt` (DateTime)
  - `dispatchedByUserId` (UUID)
  - `remarks` (String)
- **Timestamps**: `createdAt`, `updatedAt` (No soft deletes natively used in existing Prisma schema for dispatches, though we can stick to the exact schema given)

### 2. Associations
- `Dispatch` `belongsTo` `Trip`
- `Trip` `hasMany` `Dispatch` (already established in Prisma schema, need to ensure Sequelize model knows this if needed, but primary focus is Dispatch -> Trip)

## API & Business Logic
- **Cross-module Updates**: 
  - Creating a Dispatch sets the Trip status to `DISPATCHED`.
  - Also sets `actualStartDate` on Trip.
  - Updates `Vehicle` to `IN_TRANSIT` and `Driver` to `ON_TRIP`.
  - Status transition to `GATE_OUT` updates `Trip` to `IN_TRANSIT`.
  - Status transition to `CANCELLED` updates `Trip` to `PLANNED`.
- **Validation**:
  - `tripId` must exist and belong to `organizationId`.
  - Unique constraint on `organizationId` + `dispatchNumber` mapped to `409 Conflict`.
