const fs = require('fs');
const path = require('path');

const modules = [
  {
    name: 'fuel',
    modelName: 'FuelLog',
    tableName: 'fuel_logs',
    fields: [
      { name: 'vehicleId', type: 'UUID', required: true, fk: 'Vehicle' },
      { name: 'driverId', type: 'UUID', required: false, fk: 'Driver' },
      { name: 'quantity', type: 'FLOAT', required: true },
      { name: 'cost', type: 'FLOAT', required: true },
      { name: 'odometer', type: 'FLOAT', required: false },
      { name: 'date', type: 'DATE', required: true }
    ]
  },
  {
    name: 'driver-advances',
    modelName: 'DriverAdvance',
    tableName: 'driver_advances',
    fields: [
      { name: 'driverId', type: 'UUID', required: true, fk: 'Driver' },
      { name: 'tripId', type: 'UUID', required: false, fk: 'Trip' },
      { name: 'amount', type: 'FLOAT', required: true },
      { name: 'date', type: 'DATE', required: true },
      { name: 'reason', type: 'STRING', required: false }
    ]
  },
  {
    name: 'tyres',
    modelName: 'Tyre',
    tableName: 'tyres',
    fields: [
      { name: 'vehicleId', type: 'UUID', required: true, fk: 'Vehicle' },
      { name: 'serialNumber', type: 'STRING', required: true },
      { name: 'position', type: 'STRING', required: false },
      { name: 'status', type: 'STRING', required: true, default: 'ACTIVE' }
    ]
  },
  {
    name: 'maintenance',
    modelName: 'MaintenanceRecord',
    tableName: 'maintenance_records',
    fields: [
      { name: 'vehicleId', type: 'UUID', required: true, fk: 'Vehicle' },
      { name: 'date', type: 'DATE', required: true },
      { name: 'cost', type: 'FLOAT', required: true },
      { name: 'type', type: 'STRING', required: true },
      { name: 'description', type: 'STRING', required: false }
    ]
  },
  {
    name: 'compliance',
    modelName: 'ComplianceDocument',
    tableName: 'compliance_documents',
    fields: [
      { name: 'vehicleId', type: 'UUID', required: false, fk: 'Vehicle' },
      { name: 'driverId', type: 'UUID', required: false, fk: 'Driver' },
      { name: 'type', type: 'STRING', required: true },
      { name: 'expiryDate', type: 'DATE', required: true },
      { name: 'documentUrl', type: 'STRING', required: false }
    ]
  },
  {
    name: 'pod',
    modelName: 'Pod',
    tableName: 'pods',
    fields: [
      { name: 'shipmentId', type: 'UUID', required: true, fk: 'Shipment' },
      { name: 'tripId', type: 'UUID', required: true, fk: 'Trip' },
      { name: 'receivedBy', type: 'STRING', required: false },
      { name: 'signatureUrl', type: 'STRING', required: false },
      { name: 'shortageQty', type: 'FLOAT', required: false }
    ]
  },
  {
    name: 'billing',
    modelName: 'Invoice',
    tableName: 'invoices',
    fields: [
      { name: 'customerId', type: 'UUID', required: true },
      { name: 'amount', type: 'FLOAT', required: true },
      { name: 'status', type: 'STRING', required: true, default: 'DRAFT' },
      { name: 'dueDate', type: 'DATE', required: true }
    ]
  },
  {
    name: 'purchase-bills',
    modelName: 'PurchaseBill',
    tableName: 'purchase_bills',
    fields: [
      { name: 'carrierId', type: 'UUID', required: false, fk: 'Carrier' },
      { name: 'amount', type: 'FLOAT', required: true },
      { name: 'status', type: 'STRING', required: true, default: 'PENDING' },
      { name: 'dueDate', type: 'DATE', required: false }
    ]
  },
  {
    name: 'settlements',
    modelName: 'Settlement',
    tableName: 'settlements',
    fields: [
      { name: 'driverId', type: 'UUID', required: false, fk: 'Driver' },
      { name: 'carrierId', type: 'UUID', required: false, fk: 'Carrier' },
      { name: 'amount', type: 'FLOAT', required: true },
      { name: 'status', type: 'STRING', required: true, default: 'PENDING' }
    ]
  },
  {
    name: 'exceptions',
    modelName: 'ExceptionRecord',
    tableName: 'exceptions',
    fields: [
      { name: 'tripId', type: 'UUID', required: false, fk: 'Trip' },
      { name: 'vehicleId', type: 'UUID', required: false, fk: 'Vehicle' },
      { name: 'type', type: 'STRING', required: true },
      { name: 'severity', type: 'STRING', required: true, default: 'LOW' },
      { name: 'description', type: 'STRING', required: false }
    ]
  }
];

const camelCase = (str) => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
const pascalCase = (str) => {
  const c = camelCase(str);
  return c.charAt(0).toUpperCase() + c.slice(1);
};
const toSnakeCase = (str) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const generateModel = (mod) => {
  let imports = `import { Column, DataType, Model, Table, BelongsTo, ForeignKey } from 'sequelize-typescript';\n`;
  let fks = '';
  
  const fkSet = new Set();
  mod.fields.forEach(f => {
    if (f.fk) fkSet.add(f.fk);
  });
  
  if (fkSet.has('Vehicle')) imports += `import { Vehicle } from '../../vehicles/models/vehicle.model';\n`;
  if (fkSet.has('Driver')) imports += `import { Driver } from '../../drivers/models/driver.model';\n`;
  if (fkSet.has('Trip')) imports += `import { Trip } from '../../trips/models/trip.model';\n`;
  if (fkSet.has('Shipment')) imports += `import { Shipment } from '../../shipments/models/shipment.model';\n`;
  if (fkSet.has('Carrier')) imports += `import { Carrier } from '../../carriers/models/carrier.model';\n`;

  let content = `${imports}\n@Table({\n  tableName: '${mod.tableName}',\n  timestamps: true,\n  underscored: true,\n})\nexport class ${mod.modelName} extends Model<${mod.modelName}> {\n`;
  content += `  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })\n  declare id: string;\n\n`;
  content += `  @Column({ type: DataType.UUID, allowNull: false, field: 'organization_id' })\n  declare organizationId: string;\n\n`;

  mod.fields.forEach(f => {
    if (f.fk) {
      content += `  @ForeignKey(() => ${f.fk})\n`;
    }
    const nullStr = f.required ? 'allowNull: false,' : '';
    const defStr = f.default ? `defaultValue: '${f.default}',` : '';
    const fieldName = toSnakeCase(f.name);
    let dt = 'DataType.STRING';
    if (f.type === 'UUID') dt = 'DataType.UUID';
    if (f.type === 'FLOAT') dt = 'DataType.FLOAT';
    if (f.type === 'DATE') dt = 'DataType.DATE';

    content += `  @Column({ type: ${dt}, ${nullStr} ${defStr} field: '${fieldName}' })\n`;
    content += `  declare ${f.name}: ${f.type === 'FLOAT' ? 'number' : f.type === 'DATE' ? 'Date' : 'string'}${f.required ? '' : ' | null'};\n\n`;
  });

  fkSet.forEach(fk => {
    content += `  @BelongsTo(() => ${fk})\n  declare ${fk.toLowerCase()}: ${fk};\n\n`;
  });

  content += `}\n`;
  return content;
};

const generateDto = (mod, isQuery) => {
  let content = `import { IsOptional, IsUUID, IsString, IsNumber, IsDateString, IsNumberString } from 'class-validator';\n\n`;
  const className = isQuery ? `Query${mod.modelName}Dto` : `Create${mod.modelName}Dto`;
  content += `export class ${className} {\n`;
  
  if (isQuery) {
    content += `  @IsOptional()\n  @IsNumberString()\n  page?: string;\n\n  @IsOptional()\n  @IsNumberString()\n  limit?: string;\n\n`;
  }

  mod.fields.forEach(f => {
    if (isQuery) {
      content += `  @IsOptional()\n`;
    } else if (!f.required) {
      content += `  @IsOptional()\n`;
    }

    if (f.type === 'UUID') content += `  @IsUUID()\n`;
    else if (f.type === 'FLOAT') content += isQuery ? `  @IsNumberString()\n` : `  @IsNumber()\n`;
    else if (f.type === 'DATE') content += `  @IsDateString()\n`;
    else content += `  @IsString()\n`;

    content += `  ${f.name}${isQuery || !f.required ? '?' : ''}: ${f.type === 'FLOAT' && !isQuery ? 'number' : 'string'};\n\n`;
  });
  
  content += `}\n`;
  return content;
};

const generateService = (mod) => {
  const camelMod = camelCase(mod.name);
  return `import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ${mod.modelName} } from './models/${mod.name}.model';
import { Create${mod.modelName}Dto } from './dto/create-${mod.name}.dto';
import { Query${mod.modelName}Dto } from './dto/query-${mod.name}.dto';

@Injectable()
export class ${pascalCase(mod.name)}Service {
  constructor(@InjectModel(${mod.modelName}) private readonly model: typeof ${mod.modelName}) {}

  async create(organizationId: string, dto: Create${mod.modelName}Dto) {
    return this.model.create({ organizationId, ...dto } as any);
  }

  async findAll(organizationId: string, query: Query${mod.modelName}Dto) {
    const limit = parseInt(query.limit || '10', 10);
    const offset = (parseInt(query.page || '1', 10) - 1) * limit;

    const where: any = { organizationId };

    const { rows: data, count: total } = await this.model.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      data,
      meta: {
        total,
        page: parseInt(query.page || '1', 10),
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(organizationId: string, id: string) {
    const record = await this.model.findOne({ where: { id, organizationId } });
    if (!record) throw new NotFoundException('Record not found');
    return record;
  }
}
`;
};

const generateController = (mod) => {
  return `import { Controller, Get, Post, Body, Query, Param, Req } from '@nestjs/common';
import { ${pascalCase(mod.name)}Service } from './${mod.name}.service';
import { Create${mod.modelName}Dto } from './dto/create-${mod.name}.dto';
import { Query${mod.modelName}Dto } from './dto/query-${mod.name}.dto';

@Controller('${mod.name}')
export class ${pascalCase(mod.name)}Controller {
  constructor(private readonly service: ${pascalCase(mod.name)}Service) {}

  @Post()
  create(@Req() req: any, @Body() dto: Create${mod.modelName}Dto) {
    return this.service.create(req.user.organizationId, dto);
  }

  @Get()
  findAll(@Req() req: any, @Query() query: Query${mod.modelName}Dto) {
    return this.service.findAll(req.user.organizationId, query);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.service.findOne(req.user.organizationId, id);
  }
}
`;
};

const generateModule = (mod) => {
  return `import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ${pascalCase(mod.name)}Service } from './${mod.name}.service';
import { ${pascalCase(mod.name)}Controller } from './${mod.name}.controller';
import { ${mod.modelName} } from './models/${mod.name}.model';

@Module({
  imports: [SequelizeModule.forFeature([${mod.modelName}])],
  controllers: [${pascalCase(mod.name)}Controller],
  providers: [${pascalCase(mod.name)}Service],
  exports: [${pascalCase(mod.name)}Service],
})
export class ${pascalCase(mod.name)}Module {}
`;
};

const generateSpec = (mod) => {
  return `import { Test, TestingModule } from '@nestjs/testing';
import { ${pascalCase(mod.name)}Service } from './${mod.name}.service';
import { getModelToken } from '@nestjs/sequelize';
import { ${mod.modelName} } from './models/${mod.name}.model';

describe('${pascalCase(mod.name)}Service', () => {
  let service: ${pascalCase(mod.name)}Service;
  let modelMock: any;

  beforeEach(async () => {
    modelMock = {
      create: vi.fn(),
      findAndCountAll: vi.fn(),
      findOne: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ${pascalCase(mod.name)}Service,
        { provide: getModelToken(${mod.modelName}), useValue: modelMock },
      ],
    }).compile();

    service = module.get<${pascalCase(mod.name)}Service>(${pascalCase(mod.name)}Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
`;
};

const baseDir = path.join(__dirname, 'src', 'modules');

modules.forEach(mod => {
  const dir = path.join(baseDir, mod.name);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  const modelsDir = path.join(dir, 'models');
  if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir, { recursive: true });
  
  const dtoDir = path.join(dir, 'dto');
  if (!fs.existsSync(dtoDir)) fs.mkdirSync(dtoDir, { recursive: true });

  fs.writeFileSync(path.join(modelsDir, `${mod.name}.model.ts`), generateModel(mod));
  fs.writeFileSync(path.join(dtoDir, `create-${mod.name}.dto.ts`), generateDto(mod, false));
  fs.writeFileSync(path.join(dtoDir, `query-${mod.name}.dto.ts`), generateDto(mod, true));
  fs.writeFileSync(path.join(dir, `${mod.name}.service.ts`), generateService(mod));
  fs.writeFileSync(path.join(dir, `${mod.name}.controller.ts`), generateController(mod));
  fs.writeFileSync(path.join(dir, `${mod.name}.module.ts`), generateModule(mod));
  fs.writeFileSync(path.join(dir, `${mod.name}.service.spec.ts`), generateSpec(mod));
  
  console.log(`Generated ${mod.name} module.`);
});
