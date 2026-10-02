# Customers Module (Module 14) Design Spec

## Objective
Implement the Master Data module for Customers (Shippers, Consignees, or Both) within the Transport Management System. The module will transition away from the project's existing Prisma implementation by introducing **Sequelize v6** as mandated by the master architecture plan.

## Dependencies
- **Sequelize Stack**: `sequelize`, `sequelize-typescript`, `@nestjs/sequelize`, `pg`, `pg-hstore` (need to be installed as this is the first module using Sequelize).
- **Core Modules**: Auth/JWT for authentication and user/tenant context.

## Database Design (Sequelize)
Since the database table `customers` already exists (managed by Prisma), the Sequelize model will map directly to this existing table.
- **Table Name**: `customers`
- **Fields**:
  - `id` (UUID, Primary Key)
  - `organizationId` (mapped to `organization_id`, UUID) for tenant isolation
  - `name` (String)
  - `code` (String, unique within tenant)
  - `type` (Enum: SHIPPER, CONSIGNEE, BOTH)
  - `gstin`, `pan` (String, optional)
  - `email`, `phone` (String, optional)
  - `addressLine1`, `addressLine2`, `city`, `state`, `pincode` (String, optional)
  - `status` (Enum: ACTIVE, INACTIVE)
  - `createdAt`, `updatedAt`, `deletedAt` (Date fields, `deletedAt` for soft deletes)
- **Constraints**:
  - Unique index on `(organization_id, code)`.
- **Indexes**:
  - `(organization_id)`
  - `(organization_id, status)`

## Security & Tenant Isolation
- **Authentication**: Endpoints protected via standard JWT Guards.
- **Multi-Tenancy**: Every database query in `CustomersService` MUST include `where: { organizationId }`. Cross-tenant data access is strictly prevented at the service layer.

## API Design
Existing REST endpoints (mapped in `CustomersController`) will be preserved:
- `POST /api/v1/customers` - Create a customer
- `GET /api/v1/customers` - List customers (paginated, filter by `search`, `type`, `status`)
- `GET /api/v1/customers/:id` - Get a single customer
- `PATCH /api/v1/customers/:id` - Update a customer
- `DELETE /api/v1/customers/:id` - Soft delete a customer

## Business Logic
- **Uniqueness**: Customer code must be unique per organization. Sequelize's `UniqueConstraintError` will be caught and transformed into a standard `409 Conflict` HTTP response.
- **Normalization**: `code`, `gstin`, and `pan` will be stored in uppercase. `email` will be lowercased.
- **Soft Deletes**: The `remove` method sets `deletedAt`, and all read queries ensure `deletedAt: null`.

## Error Handling
Errors will map to the agreed TMS standardized format:
```json
{
  "success": false,
  "statusCode": 409,
  "code": "CUSTOMER_ALREADY_EXISTS",
  "message": "Customer with this code already exists in your organization",
  "requestId": "..."
}
```

## Queues & Events
- Basic CRUD operations for customers do not require Outbox events or background BullMQ processing at this phase.
