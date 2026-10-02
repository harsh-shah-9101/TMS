# LR (Lorry Receipts) Module (Module 17) Design Spec

## Objective
Migrate the Lorry Receipts module from Prisma to Sequelize, maintaining its role as the financial and legal document representing freight carriage within Phase 4.

## Database Design (Sequelize)
The module relies on a single model mapping to the `lorry_receipts` table.

### 1. Lr Model (`lorry_receipts` table)
- **Primary Key**: `id` (UUID)
- **Tenant Context**: `organizationId` (UUID, required for all queries)
- **Foreign Keys**: `shipmentId` (UUID)
- **Core Fields**:
  - `lrNumber` (String, unique within organization)
  - `lrDate` (DateTime)
  - `consignorName`, `consignorAddress` (String)
  - `consigneeName`, `consigneeAddress` (String)
  - `freightTerms` (Enum: PAID, TO_PAY, TO_BE_BILLED)
  - `basicFreight`, `otherCharges`, `taxAmount`, `totalAmount` (Float)
  - `remarks` (String)
  - `status` (Enum: ISSUED, CANCELLED)
- **Timestamps**: `createdAt`, `updatedAt`, `deletedAt` (paranoid)

### 2. Associations
- `Lr.belongsTo(Shipment, { foreignKey: 'shipmentId' })`
- `Shipment.hasMany(Lr, { foreignKey: 'shipmentId' })` (Optional to define on Shipment side, but useful if we fetch LR from shipments)

## API & Business Logic
- **Controller**: Keep `LrController` intact with existing DTOs and RBAC (`ADMIN`, `TRANSPORT_MANAGER`, `DISPATCHER`, `ACCOUNTS`).
- **Creation Logic**: `totalAmount` is calculated securely on the server-side as the sum of `basicFreight`, `otherCharges`, and `taxAmount`. Validates that the requested `shipmentId` exists within the same organization.
- **Tenant Isolation**: Strict enforcement of `where: { organizationId }` across all queries (`create`, `findAll`, `findOne`, `update`, `remove`).
- **Duplicate Prevention**: Intercept `SequelizeUniqueConstraintError` for `lrNumber` and throw `409 Conflict`.
