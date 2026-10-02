# Carriers Module (Module 15) Design Spec

## Objective
Implement the Master Data module for Carriers (Transporters) within the Transport Management System. Following the architectural precedent set in Module 14, this module will transition its data access layer to **Sequelize v6** instead of Prisma.

## Dependencies
- **Sequelize Stack**: Existing `@nestjs/sequelize` integration in the project.
- **Core Modules**: Auth/JWT for authentication and user/tenant context.

## Database Design (Sequelize)
The Sequelize model will map directly to the existing `carriers` table originally scaffolded for Prisma.
- **Table Name**: `carriers`
- **Fields**:
  - `id` (UUID, Primary Key)
  - `organizationId` (mapped to `organization_id`, UUID) for tenant isolation
  - `name` (String)
  - `code` (String, unique within tenant)
  - `gstin`, `pan` (String, optional)
  - `email`, `phone` (String, optional)
  - `addressLine1`, `city`, `state`, `pincode` (String, optional)
  - `rating` (Float, default 5.0)
  - `status` (Enum: ACTIVE, INACTIVE, BLACKLISTED)
  - `createdAt`, `updatedAt`, `deletedAt` (Date fields, `deletedAt` for soft deletes)
- **Constraints**:
  - Unique index on `(organization_id, code)`.
- **Indexes**:
  - `(organization_id)`
  - `(organization_id, status)`

## Security & Tenant Isolation
- **Authentication**: Endpoints protected via standard JWT Guards.
- **Multi-Tenancy**: Every database query in `CarriersService` MUST include `where: { organizationId }`. Cross-tenant data access is strictly prevented at the service layer.

## API Design
Existing REST endpoints (mapped in `CarriersController`) will be preserved:
- `POST /api/v1/carriers` - Create a carrier
- `GET /api/v1/carriers` - List carriers (paginated, filter by `search`, `status`)
- `GET /api/v1/carriers/:id` - Get a single carrier
- `PATCH /api/v1/carriers/:id` - Update a carrier
- `DELETE /api/v1/carriers/:id` - Soft delete a carrier

## Business Logic
- **Uniqueness**: Carrier code must be unique per organization. Sequelize's `UniqueConstraintError` will be caught and transformed into a standard `409 Conflict` HTTP response.
- **Normalization**: `code`, `gstin`, and `pan` will be stored in uppercase. `email` will be lowercased.
- **Soft Deletes**: The `remove` method sets `deletedAt`, and all read queries ensure `deletedAt: null`.

## Error Handling
Errors will map to the agreed TMS standardized format:
```json
{
  "success": false,
  "statusCode": 409,
  "code": "CARRIER_ALREADY_EXISTS",
  "message": "Carrier with this code already exists in your organization",
  "requestId": "..."
}
```
