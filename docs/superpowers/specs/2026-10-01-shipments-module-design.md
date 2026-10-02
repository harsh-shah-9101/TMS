# Shipments / Bookings Module (Module 16) Design Spec

## Objective
Migrate the Shipments / Bookings master and transactional data module from Prisma to Sequelize, marking the beginning of Phase 4 (Operations).

## Database Design (Sequelize)
The module consists of two interconnected tables: `shipments` and `shipment_items`.

### 1. Shipment Model (`shipments` table)
- **Primary Key**: `id` (UUID)
- **Tenant Context**: `organizationId` (UUID, required for all queries)
- **Foreign Keys**: `customerId` (UUID), `consigneeId` (UUID, nullable)
- **Core Fields**:
  - `bookingNumber` (String, unique within organization)
  - `originCity`, `originPincode`
  - `destinationCity`, `destinationPincode`
  - `pickupDate`, `expectedDeliveryDate`
  - `totalWeightKg`, `totalVolumeCuFt`, `freightAmount`
  - `status` (Enum: DRAFT, CREATED, VALIDATED, PLANNED, ASSIGNED, IN_TRANSIT, DELIVERED, CANCELLED)
- **Timestamps**: `createdAt`, `updatedAt`, `deletedAt` (paranoid)

### 2. ShipmentItem Model (`shipment_items` table)
- **Primary Key**: `id` (UUID)
- **Foreign Key**: `shipmentId` (UUID)
- **Core Fields**: `description`, `quantity`, `weightKg`, `volumeCuFt`, `declaredValue`
- **Timestamps**: `createdAt`, `updatedAt` (No soft delete required as it cascades with shipment)

### 3. Associations
- `Shipment.hasMany(ShipmentItem, { foreignKey: 'shipmentId', as: 'items' })`
- `ShipmentItem.belongsTo(Shipment, { foreignKey: 'shipmentId' })`
- `Shipment.belongsTo(Customer, { as: 'customer', foreignKey: 'customerId' })`
- `Shipment.belongsTo(Customer, { as: 'consignee', foreignKey: 'consigneeId' })`
- `Customer.hasMany(Shipment, { as: 'customerShipments', foreignKey: 'customerId' })`
- `Customer.hasMany(Shipment, { as: 'consigneeShipments', foreignKey: 'consigneeId' })`

## API & Business Logic
- **Controller**: Retain `ShipmentsController` and its RBAC guards.
- **Creation Logic**: Calculate `totalWeightKg` and `totalVolumeCuFt` during creation based on nested `items`. Use Sequelize nested includes to create shipment and items transactionally.
- **State Machine**: Implement strict workflow validation using the predefined `allowedTransitions` matrix.
- **Tenant Isolation**: Mandatory `organizationId` on all `.findAll()`, `.findOne()`, `.update()`, and `.destroy()` calls.
- **Duplicate Prevention**: Transform `SequelizeUniqueConstraintError` into HTTP `409 Conflict`.
