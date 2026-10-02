const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const enumCode = `
export enum RoleName {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  TRANSPORT_MANAGER = 'TRANSPORT_MANAGER',
  DISPATCHER = 'DISPATCHER',
  FLEET_MANAGER = 'FLEET_MANAGER',
  ACCOUNTS = 'ACCOUNTS',
  DRIVER = 'DRIVER',
  VIEWER = 'VIEWER',
}

export enum OwnershipType {
  OWNED = 'OWNED',
  LEASED = 'LEASED',
  MARKET = 'MARKET',
}

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  IN_TRANSIT = 'IN_TRANSIT',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
}

export enum FuelType {
  DIESEL = 'DIESEL',
  PETROL = 'PETROL',
  CNG = 'CNG',
  ELECTRIC = 'ELECTRIC',
  OTHER = 'OTHER',
}

export enum VehicleTypeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum DriverStatus {
  AVAILABLE = 'AVAILABLE',
  ON_TRIP = 'ON_TRIP',
  ON_LEAVE = 'ON_LEAVE',
  INACTIVE = 'INACTIVE',
}

export enum TripStatus {
  DRAFT = 'DRAFT',
  PLANNED = 'PLANNED',
  DISPATCHED = 'DISPATCHED',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum StopStatus {
  PENDING = 'PENDING',
  ARRIVED = 'ARRIVED',
  DEPARTED = 'DEPARTED',
  SKIPPED = 'SKIPPED',
}

export enum StopType {
  PICKUP = 'PICKUP',
  DELIVERY = 'DELIVERY',
  REST = 'REST',
  FUEL = 'FUEL',
  WEIGH = 'WEIGH',
  OTHER = 'OTHER',
}

export enum ShipmentStatus {
  DRAFT = 'DRAFT',
  BOOKED = 'BOOKED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum RouteStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum FreightTerm {
  PREPAID = 'PREPAID',
  TO_PAY = 'TO_PAY',
  TO_BE_BILLED = 'TO_BE_BILLED',
}

export enum LRStatus {
  DRAFT = 'DRAFT',
  GENERATED = 'GENERATED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum CustomerType {
  REGULAR = 'REGULAR',
  CORPORATE = 'CORPORATE',
  INDIVIDUAL = 'INDIVIDUAL',
}

export enum DispatchStatus {
  DRAFT = 'DRAFT',
  ASSIGNED = 'ASSIGNED',
  DISPATCHED = 'DISPATCHED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum CarrierStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLACKLISTED = 'BLACKLISTED',
}
`;

fs.writeFileSync(path.join(srcDir, 'common', 'enums.ts'), enumCode.trim());
console.log('Created src/common/enums.ts');

function findFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findFiles(fullPath, filesList);
    } else if (fullPath.endsWith('.ts')) {
      filesList.push(fullPath);
    }
  }
  return filesList;
}

const allTsFiles = findFiles(srcDir);
let changedCount = 0;

for (const file of allTsFiles) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('@prisma/client')) {
    // We need to replace import { ... } from '@prisma/client' with import { ... } from 'relative/path/to/enums'
    
    // Determine relative path from this file to src/common/enums.ts
    const relativePathToCommon = path.relative(path.dirname(file), path.join(srcDir, 'common', 'enums'));
    let importPath = relativePathToCommon.replace(/\\/g, '/');
    if (!importPath.startsWith('.')) {
      importPath = './' + importPath;
    }
    
    // Replace '@prisma/client' with the relative path
    content = content.replace(/from\s+['"]@prisma\/client['"]/g, \`from '\${importPath}'\`);
    
    fs.writeFileSync(file, content);
    console.log(\`Updated \${file}\`);
    changedCount++;
  }
}

console.log(\`Updated \${changedCount} files.\`);
