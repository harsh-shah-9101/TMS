# Routes Module (Module 18) Design Spec

## Objective
Migrate the Routes module from Prisma to Sequelize. This module manages operational route master data for trip planning in Phase 4.

## Database Design (Sequelize)
The module maps to the `routes` table.

### 1. Route Model (`routes` table)
- **Primary Key**: `id` (UUID)
- **Tenant Context**: `organizationId` (UUID, required for all queries)
- **Core Fields**:
  - `name` (String)
  - `code` (String, unique within organization)
  - `originCity`, `originState` (String)
  - `destinationCity`, `destinationState` (String)
  - `distanceKm` (Float)
  - `estimatedHours` (Float)
  - `status` (Enum: ACTIVE, INACTIVE)
- **Timestamps**: `createdAt`, `updatedAt`, `deletedAt` (paranoid)

## API & Business Logic
- **Controller**: Keep `RoutesController` intact with existing DTOs and RBAC (`ADMIN`, `TRANSPORT_MANAGER`, `DISPATCHER`).
- **Tenant Isolation**: Strict enforcement of `where: { organizationId }` across all queries (`create`, `findAll`, `findOne`, `update`, `remove`).
- **Duplicate Prevention**: Intercept `SequelizeUniqueConstraintError` for `code` and throw `409 Conflict`.
