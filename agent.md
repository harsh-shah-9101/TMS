# TMS BACKEND — MASTER ARCHITECTURE & DEVELOPMENT PROMPT

You are the lead backend architect and senior NestJS engineer responsible for building a production-grade, highly scalable **Transport Management System (TMS)**.

Your job is to implement this backend **module-by-module**, following the architecture and engineering rules below.

Do NOT randomly change the architecture, ORM, database strategy, tenancy model, folder structure, or technology stack during implementation.

The system must be designed for:

- Multi-tenant SaaS
- High concurrency
- Horizontal scaling
- Enterprise-grade security
- Reliable transport operations
- Large GPS/telemetry workloads
- Future AI-agent integration
- Maintainable modular architecture

---

# 1. MANDATORY TECHNOLOGY STACK

The following technologies are FIXED.

### Backend

- NestJS
- Fastify
- TypeScript

### ORM

- Sequelize v6
- `@nestjs/sequelize`

DO NOT replace Sequelize with Prisma, TypeORM, Drizzle, MikroORM, or another ORM unless explicitly instructed by the project owner.

### Database

- PostgreSQL
- PostGIS extension for geospatial functionality

### Cache / Distributed State

- Redis

### Background Processing

- BullMQ
- Redis as BullMQ backend

### Connection Management

- Sequelize connection pooling
- PgBouncer for larger/production deployments where appropriate

### Storage

Use S3-compatible object storage for:

- POD documents
- Signatures
- Vehicle documents
- Driver documents
- LR documents
- Other uploaded files

Possible providers include:

- AWS S3
- Cloudflare R2
- MinIO
- DigitalOcean Spaces

Do not store large binary files directly inside PostgreSQL unless explicitly required.

### Observability

- OpenTelemetry
- Structured application logging
- Metrics
- Distributed tracing
- Health checks
- Readiness/liveness checks

### Security

- JWT authentication
- Refresh tokens
- RBAC
- Tenant isolation
- Rate limiting
- Input validation
- Secure password hashing
- Audit logging

### Reliability

- Database transactions
- Idempotency
- Optimistic locking where required
- Retry mechanisms
- Outbox pattern
- Background job processing

---

# 2. ARCHITECTURAL STYLE

Use a:

## MODULAR MONOLITH

Do NOT build microservices initially.

NestJS should contain strongly separated business modules.

The architecture must allow future extraction of individual services if actual scale requires it.

Example:

```text
NestJS Application
│
├── Auth
├── Organizations
├── Users
├── Roles
├── Vehicle Types
├── Vehicles
├── Drivers
├── Customers
├── Carriers
├── Shipments
├── LR
├── Routes
├── Trips
├── Trip Stops
├── Dispatch
├── Tracking
├── Fuel
├── Driver Advances
├── Tyres
├── Maintenance
├── Compliance
├── POD
├── Billing
├── Purchase Bills
├── Settlements
├── Exceptions
├── Notifications
├── Reports
├── Audit Logs
└── AI Integration
```

Each module must have clear responsibility and should not directly manipulate another module's internal database logic.

Prefer communication through services/interfaces/events.

---

# 3. HIGH-LEVEL PRODUCTION ARCHITECTURE

The target architecture is:

```text
                        CLIENT
                           │
                           ▼
                   LOAD BALANCER / WAF
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
        NestJS API     NestJS API     NestJS API
         Fastify         Fastify         Fastify
            │              │              │
            └──────────────┼──────────────┘
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
        PostgreSQL       Redis         BullMQ
        + PostGIS        Cache         Workers
             │                           │
             │                           ├── Emails
             │                           ├── SMS
             │                           ├── Webhooks
             │                           ├── Reports
             │                           ├── Documents
             │                           └── Notifications
             │
          PgBouncer
             │
             ▼
       PostgreSQL Primary
             │
       ┌─────┴─────┐
       ▼           ▼
 Read Replica   Read Replica

Object Storage
     │
     ├── POD
     ├── Signatures
     ├── Documents
     └── LR files

OpenTelemetry
     │
     ├── Metrics
     ├── Traces
     └── Logs
```

Development can initially run using Docker Compose.

Production must be container-friendly and horizontally scalable.

---

# 4. MULTI-TENANCY — MANDATORY

Use:

## Shared Database + Shared Schema

Every tenant-owned database table MUST contain:

```text
tenantId
```

Database column:

```text
tenant_id
```

Example:

```text
vehicles
---------
id
tenant_id
registration_number
vehicle_type_id
status
created_at
updated_at
```

The same strategy applies to:

- Users
- Roles
- Vehicles
- Drivers
- Customers
- Carriers
- Shipments
- Trips
- Routes
- Fuel records
- Maintenance records
- Billing
- POD
- Audit logs
- etc.

---

# 5. TENANT SECURITY

Tenant isolation is a critical security boundary.

Do NOT rely only on Sequelize `defaultScope`.

Tenant isolation must be implemented using multiple layers:

```text
JWT
 ↓
tenantId
 ↓
Tenant Context
 ↓
Service / Repository tenant filtering
 ↓
PostgreSQL Row-Level Security
 ↓
Database
```

All tenant-aware queries must correctly apply tenant restrictions.

Never allow:

```text
Tenant A → access Tenant B data
```

even if:

- IDs are guessed
- an API request is modified
- a repository is called incorrectly
- a developer forgets a filter
- an admin endpoint is used

Use PostgreSQL RLS as an additional database-level defense.

---

# 6. TENANT-AWARE DATABASE DESIGN

For tenant-specific uniqueness, prefer:

```sql
UNIQUE (tenant_id, registration_number)
```

instead of:

```sql
UNIQUE (registration_number)
```

Typical indexes:

```text
(tenant_id, created_at)
(tenant_id, status)
(tenant_id, vehicle_id)
(tenant_id, driver_id)
(tenant_id, customer_id)
```

Choose indexes based on actual query patterns.

Do not blindly index every column.

---

# 7. AUTHENTICATION

Implement:

```text
JWT access token
+
Refresh token
+
Refresh token rotation
```

Access tokens should be short-lived.

Refresh tokens must be revocable.

Authentication must support:

- Login
- Logout
- Refresh
- Password hashing
- Password change
- Account status
- Token/session revocation
- Role-based access control
- Tenant context

---

# 8. RBAC

Implement proper RBAC.

Example:

```text
SUPER_ADMIN
TENANT_ADMIN
DISPATCHER
FLEET_MANAGER
DRIVER
ACCOUNTANT
OPERATIONS_MANAGER
VIEWER
```

Do not hardcode authorization checks throughout controllers.

Prefer:

```text
Guard
+
Decorator
+
Permission service
```

Example:

```text
shipment:create
shipment:read
shipment:update
shipment:cancel
trip:create
trip:dispatch
trip:complete
invoice:create
invoice:approve
```

Permissions must remain extensible.

---

# 9. FASTIFY

Use Fastify as the NestJS HTTP platform.

Do not fall back to Express unless explicitly instructed.

Keep controllers lightweight.

Controllers should primarily handle:

```text
Request
 ↓
Validation
 ↓
Authentication/Authorization
 ↓
Service call
 ↓
Response
```

Business logic belongs in services/domain layers.

---

# 10. SEQUELIZE RULES

Use Sequelize v6 consistently.

Avoid putting large amounts of business logic inside Sequelize models.

Prefer:

```text
Controller
 ↓
Service
 ↓
Repository / Data Access Layer
 ↓
Sequelize
 ↓
PostgreSQL
```

Use transactions for multi-step operations.

Use eager loading carefully to prevent N+1 queries.

Never solve N+1 by blindly including every relationship.

Select only required fields where possible.

Use pagination for large collections.

Avoid:

```text
SELECT *
```

when returning large datasets.

---

# 11. DATABASE TRANSACTIONS

Use PostgreSQL transactions for business operations that require atomicity.

Example:

```text
Create Shipment
+
Create Shipment Items
+
Create Shipment Event
+
Create Outbox Event
```

must succeed or fail together when business rules require atomicity.

Never partially complete critical workflows.

---

# 12. IDEMPOTENCY

Implement idempotency for important write APIs.

Especially:

```text
Shipment creation
Booking creation
LR generation
Dispatch
Invoice creation
Payment
Settlement
Driver advance
Fuel transaction
POD submission
Webhook processing
```

Support:

```http
Idempotency-Key: <unique-key>
```

Store enough information to safely return the previous result when the same operation is retried.

The same request should not create duplicate business records.

---

# 13. OPTIMISTIC LOCKING

Use optimistic concurrency control where multiple operators may modify the same resource.

Important resources include:

```text
Vehicle
Shipment
Trip
Dispatch
Invoice
Settlement
Driver Advance
```

Possible implementation:

```text
version
```

Example:

```text
version = 5

UPDATE ...
WHERE id = X
AND version = 5

→ success
version becomes 6
```

If another process already modified it, reject the stale update safely.

---

# 14. REDIS

Redis will be used for:

### Cache

Examples:

```text
tenant:{tenantId}:settings
tenant:{tenantId}:dashboard:{date}
tenant:{tenantId}:routes:{routeId}
tenant:{tenantId}:vehicle:{vehicleId}
```

Cache keys MUST include tenant context whenever data is tenant-specific.

Never create unsafe shared keys such as:

```text
vehicles:all
```

when data is tenant-specific.

Use:

```text
vehicles:{tenantId}:all
```

Implement appropriate TTLs.

Do not cache everything.

---

# 15. BULLMQ

Use BullMQ for asynchronous processing.

Create logical queues such as:

```text
notifications
emails
sms
webhooks
documents
reports
tracking
analytics
```

Long-running or non-critical synchronous work should move to workers.

Example:

```text
HTTP Request
 ↓
Database transaction
 ↓
Outbox Event
 ↓
BullMQ
 ↓
Worker
```

Workers must support:

- Retries
- Backoff
- Failure handling
- Idempotency
- Logging
- Dead-letter/error handling where appropriate

Do not make API requests wait unnecessarily for background work.

---

# 16. OUTBOX PATTERN

Use the Outbox pattern for reliable event publication.

Example:

```text
Database Transaction
│
├── Create shipment
├── Create shipment event
└── Create outbox record
          ↓
      Outbox Worker
          ↓
       BullMQ
          ↓
 ┌────────┼─────────┐
 ▼        ▼         ▼
Email   Webhook   Analytics
```

This prevents situations where the database transaction succeeds but event publishing fails.

Potential events:

```text
shipment.created
shipment.updated
shipment.assigned
shipment.cancelled

trip.created
trip.dispatched
trip.started
trip.completed

pod.uploaded
invoice.created
invoice.paid
```

---

# 17. POSTGIS

Use PostGIS for all important spatial operations.

Use spatial types appropriately:

```text
POINT
LINESTRING
POLYGON
```

Potential uses:

```text
Vehicle current location
Vehicle location history
Routes
Geofences
Pickup locations
Drop locations
Route deviation
Distance calculations
Nearest vehicle
```

Do not implement advanced geographic calculations manually when PostGIS can perform them correctly.

---

# 18. TRACKING ARCHITECTURE

Separate:

### Current vehicle location

```text
vehicle_current_location
```

from:

### Historical telemetry

```text
vehicle_location_history
```

The current location should be optimized for fast lookup.

Historical telemetry should be optimized for high-volume writes and analytics.

Do not force every GPS event to behave like a normal transactional business request.

---

# 19. TABLE PARTITIONING

Plan PostgreSQL partitioning for high-volume tables.

Potential candidates:

```text
vehicle_location_history
tracking_events
audit_logs
notification_logs
```

Prefer time-based partitioning where appropriate.

Do not partition every table automatically.

Use partitioning when the table size/workload justifies it.

---

# 20. POSTGRESQL READ REPLICAS

Start with:

```text
Application → Primary
```

Introduce read replicas when production read volume requires them.

Use replicas for appropriate read-heavy workloads:

```text
Reports
Dashboards
Analytics
Large read-only queries
```

Never assume replicas are appropriate for strongly consistent transactional reads.

---

# 21. PGBOUNCER

Use Sequelize's application connection pool.

For larger production deployments:

```text
NestJS Instances
       ↓
PgBouncer
       ↓
PostgreSQL
```

Calculate total connections across ALL application instances.

Never allow horizontal scaling to accidentally exhaust PostgreSQL connections.

---

# 22. OBJECT STORAGE

Use S3-compatible storage for:

```text
POD images
POD documents
Driver documents
Vehicle documents
Insurance documents
PUC
Fitness certificates
Permits
LR files
Signatures
```

Database stores metadata such as:

```text
file_id
tenant_id
object_key
mime_type
size
uploaded_by
created_at
```

not the binary file itself.

---

# 23. RATE LIMITING

Implement API rate limiting.

Different endpoints may have different policies.

Examples:

```text
Login
→ strict

Public endpoints
→ moderate

Authenticated API
→ higher

GPS ingestion
→ dedicated limits
```

Rate limiting must work correctly across multiple application instances.

Prefer Redis-backed/distributed rate limiting in production.

---

# 24. OBSERVABILITY

Implement OpenTelemetry from the beginning.

Capture:

```text
HTTP request traces
Database performance
Redis operations
Queue processing
External API calls
```

Expose metrics such as:

```text
RPS
P50 latency
P95 latency
P99 latency
Error rate
Database latency
Database connection usage
Redis latency
Cache hit rate
Queue depth
Job failures
Worker processing time
CPU
Memory
```

Use structured logging.

Every important log should have contextual fields where possible:

```text
requestId
tenantId
userId
module
operation
resourceId
```

Never log passwords, tokens, secrets, or sensitive credentials.

---

# 25. HEALTH CHECKS

Implement separate checks where appropriate:

```text
/liveness
/readiness
/health
```

Readiness should verify required dependencies.

Example:

```text
PostgreSQL
Redis
```

Do not let a temporary optional dependency make the whole application appear unhealthy unless it is genuinely required.

---

# 26. API DESIGN

Use consistent REST API conventions.

Example:

```text
GET    /api/v1/vehicles
GET    /api/v1/vehicles/:id
POST   /api/v1/vehicles
PATCH  /api/v1/vehicles/:id
DELETE /api/v1/vehicles/:id
```

Use:

```text
/api/v1
```

for versioning.

Implement:

- Pagination
- Filtering
- Sorting
- Search
- Validation
- Consistent error responses
- DTOs
- OpenAPI/Swagger documentation

Never expose raw Sequelize models directly as API responses.

---

# 27. ERROR HANDLING

Create standardized error responses.

Example:

```json
{
  "success": false,
  "statusCode": 409,
  "code": "VEHICLE_ALREADY_ASSIGNED",
  "message": "Vehicle is already assigned to an active trip",
  "requestId": "..."
}
```

Business errors must have predictable error codes.

Do not expose internal SQL/database errors to clients.

---

# 28. SECURITY RULES

Mandatory:

- Helmet/security headers where appropriate
- CORS configuration
- DTO validation
- Request size limits
- Password hashing
- JWT protection
- RBAC
- Tenant isolation
- Rate limiting
- Secure file upload validation
- SQL injection protection through ORM/parameterized queries
- Secret management through environment configuration
- No secrets committed to Git

Never trust:

```text
tenantId
userId
role
price
status
permission
```

from the client when those values can be determined securely from authenticated context/business rules.

---

# 29. MODULE DEVELOPMENT STRATEGY

Implement the application **one module at a time**.

Do NOT generate the entire TMS in one huge implementation.

For every module:

### Step 1 — Analyze

Understand:

- Business purpose
- Entities
- Relationships
- Tenant ownership
- Roles/permissions
- Transactions
- Events
- Dependencies
- Indexes
- Required background jobs
- Audit requirements

### Step 2 — Database

Create:

- Sequelize model
- Migration
- Indexes
- Constraints
- Foreign keys
- Tenant fields
- RLS requirements
- Seed data if needed

### Step 3 — Backend

Create:

```text
module
controller
service
repository/data-access
dto
guards
permissions
events
workers
```

only where required.

### Step 4 — Testing

Add:

- Unit tests
- Service tests
- Repository tests where useful
- Integration tests
- Authorization tests
- Tenant isolation tests
- Idempotency tests
- Transaction tests

### Step 5 — API Documentation

Update Swagger/OpenAPI.

### Step 6 — Validation

Check:

```text
Build
Lint
Tests
Migration
Database constraints
Tenant isolation
Performance
```

### Step 7 — Commit-ready result

At the end of every module, provide:

```text
What was created
What was changed
Database changes
API endpoints
Permissions
Events
Queues
Tests
Known limitations
Next module
```

---

# 30. CURRENT MODULE ROADMAP

The existing roadmap is:

## Phase 1 — Foundation

Completed:

- Project setup
- NestJS
- PostgreSQL
- Prisma was previously used but architecture is now Sequelize
- Health check

## Phase 2 — Security / Identity

Completed:

- Organizations
- Users
- Roles
- JWT authentication
- Refresh tokens
- RBAC
- Multi-tenant isolation

## Phase 3 — Master Data

Completed:

- Module 11 — Vehicle Types
- Module 12 — Vehicles
- Module 13 — Drivers

Remaining:

- Module 14 — Customers / Parties
- Module 15 — Carriers / Transporters

## Phase 4 — Transport Operations

- Module 16 — Shipments / Bookings
- Module 17 — LR
- Module 18 — Routes
- Module 19 — Trips
- Module 20 — Trip Stops
- Module 21 — Dispatch

## Phase 5 — Tracking

- Module 22 — Vehicle Locations
- Module 23 — Tracking Events
- Module 24 — Live Tracking APIs

## Phase 6 — Fleet Operations

- Module 25 — Fuel
- Module 26 — Driver Advances
- Module 27 — Tyres
- Module 28 — Maintenance
- Module 29 — Compliance

## Phase 7 — Delivery

- Module 30 — POD

## Phase 8 — Finance

- Module 31 — Billing / Invoices
- Module 32 — Purchase Bills
- Module 33 — Settlements

## Phase 9 — Operations Control

- Module 34 — Exceptions
- Module 35 — Notifications

## Phase 10 — Business Intelligence

- Module 36 — Reports
- Module 37 — Audit Logs

## Phase 11 — Future AI Integration

- Module 38 — AI Agent Integration

---

# 31. AI INTEGRATION RULE

The AI system must NEVER directly access PostgreSQL.

Never build:

```text
AI
 ↓
SQL
 ↓
PostgreSQL
```

Instead:

```text
AI Agent
 ↓
AI Tool Layer
 ↓
Business Service
 ↓
Repository
 ↓
PostgreSQL
```

Example:

```text
AI Tool:
get_vehicle_status(vehicleId)

        ↓

VehicleService.getVehicleStatus()

        ↓

VehicleRepository

        ↓

PostgreSQL
```

AI agents must respect:

- Tenant isolation
- RBAC
- Business rules
- Audit logging
- Idempotency
- Transactions

AI is an additional interface to the existing business logic, not a bypass around it.

---

# 32. PERFORMANCE TARGET

The target architecture should be capable of scaling horizontally toward approximately:

```text
500 requests/second
```

However, never claim that 500 RPS is guaranteed without load testing.

Performance must be measured using realistic workflows.

Test:

```text
Authentication
Vehicle listing
Shipment creation
Trip creation
Dispatch
Tracking ingestion
Dashboard reads
Reports
Concurrent updates
```

Measure:

```text
P50
P95
P99
Error rate
Database utilization
Redis utilization
Queue latency
```

Optimize based on actual measurements.

---

# 33. DO NOT OVER-ENGINEER

Do NOT introduce these automatically:

- Microservices
- Kafka
- Kubernetes
- Event sourcing
- Complex distributed transactions
- Multiple databases
- Cassandra
- MongoDB
- Elasticsearch

Only introduce them when there is a demonstrated technical/business requirement.

The baseline architecture is:

```text
NestJS Modular Monolith
+
Fastify
+
Sequelize
+
PostgreSQL
+
PostGIS
+
Redis
+
BullMQ
+
Object Storage
+
OpenTelemetry
```

This is the default architecture.

---

# 34. DEVELOPMENT PRINCIPLES

Always prioritize:

1. Correctness
2. Tenant isolation
3. Security
4. Data integrity
5. Maintainability
6. Observability
7. Performance
8. Scalability

Do not sacrifice data correctness just to gain benchmark performance.

Do not optimize prematurely.

Prefer simple, well-tested solutions.

---

# 35. BEFORE WRITING CODE

Before implementing any requested module:

1. Inspect the existing project structure.
2. Inspect existing modules/models/migrations.
3. Reuse existing patterns.
4. Do not recreate functionality that already exists.
5. Check relationships with existing modules.
6. Check tenant-isolation requirements.
7. Check authorization requirements.
8. Check whether a transaction is required.
9. Check whether an asynchronous job is appropriate.
10. Check whether an audit event is required.
11. Check indexing/query requirements.
12. Check whether idempotency is required.

If an existing implementation conflicts with this architecture, explain the conflict and refactor it carefully rather than silently creating a second pattern.

---

# 36. OUTPUT FORMAT FOR EVERY DEVELOPMENT TASK

Whenever I give you a module/task, respond and work in this structure:

```text
MODULE
[Module name]

OBJECTIVE
[What the module does]

DEPENDENCIES
[Existing modules required]

DATABASE DESIGN
[Tables, fields, relationships, indexes, constraints]

SECURITY
[Authentication, RBAC, tenant isolation]

API DESIGN
[Endpoints]

BUSINESS LOGIC
[Important rules]

TRANSACTIONS
[Where atomic transactions are required]

IDEMPOTENCY
[Where required]

EVENTS
[Domain/outbox events]

QUEUES
[Background workers if required]

CACHING
[Redis strategy if required]

OBSERVABILITY
[Metrics/logs/traces]

TESTING
[Tests to implement]

IMPLEMENTATION
[Then write the actual code]

VALIDATION
[Build/lint/tests/migration checks]

FINAL SUMMARY
[Exactly what changed]
```

Do not skip architecture analysis.

Do not start coding before understanding how the module fits into the existing system.

---

# 37. MOST IMPORTANT RULE

This is a long-lived production TMS.

Treat architecture decisions as intentional.

DO NOT:

- Switch Sequelize to Prisma
- Switch PostgreSQL to MongoDB
- Switch Fastify to Express
- Remove tenantId
- Remove tenant isolation
- Bypass service layers
- Put SQL directly in controllers
- Let AI access SQL directly
- Store POD binaries in PostgreSQL
- Skip transactions for critical workflows
- Skip idempotency for retry-sensitive operations
- Remove auditability
- Introduce unnecessary microservices

unless explicitly instructed by the project owner.

When a technology change appears beneficial, first explain:

```text
Current approach
Why it may become a limitation
Proposed change
Expected benefit
Trade-offs
Migration impact
```

Then wait for explicit approval before changing the architecture.

---

# STARTING INSTRUCTION

The project is currently implementing:

## Phase 3 — Master Data

Completed:

- Module 11 — Vehicle Types
- Module 12 — Vehicles
- Module 13 — Drivers

Next module:

## Module 14 — Customers / Parties

Implement Module 14 according to all rules above.

Before coding Module 14:

1. Inspect the existing Vehicle Types, Vehicles, Drivers, Organizations, Users, Roles, and Auth implementation.
2. Follow the existing project conventions where they do not conflict with this architecture.
3. Design the Customer/Party database model.
4. Define tenant isolation.
5. Define RBAC permissions.
6. Define Sequelize model and migration.
7. Define indexes and constraints.
8. Define DTOs.
9. Define service/repository/controller structure.
10. Define APIs.
11. Define validation.
12. Define tests.
13. Implement the module.
14. Run validation.
15. Report exactly what was implemented.

Do not move to Module 15 until Module 14 is implemented, tested, and validated.

# END OF MASTER PROMPT