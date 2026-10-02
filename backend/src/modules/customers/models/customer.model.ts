import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'customers',
  timestamps: true,
  paranoid: true, // Enables soft deletes using deletedAt
  underscored: true, // Uses snake_case for database columns (e.g., created_at)
})
export class Customer extends Model<Customer> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'organization_id',
  })
  declare organizationId: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  declare code: string;

  @Column({
    type: DataType.ENUM('SHIPPER', 'CONSIGNEE', 'BOTH'),
    defaultValue: 'BOTH',
  })
  declare type: string;

  @Column(DataType.STRING(20))
  declare gstin: string | null;

  @Column(DataType.STRING(20))
  declare pan: string | null;

  @Column(DataType.STRING(255))
  declare email: string | null;

  @Column(DataType.STRING(20))
  declare phone: string | null;

  @Column({
    type: DataType.STRING(255),
    field: 'address_line1',
  })
  declare addressLine1: string | null;

  @Column({
    type: DataType.STRING(255),
    field: 'address_line2',
  })
  declare addressLine2: string | null;

  @Column(DataType.STRING(100))
  declare city: string | null;

  @Column(DataType.STRING(100))
  declare state: string | null;

  @Column(DataType.STRING(20))
  declare pincode: string | null;

  @Column({
    type: DataType.ENUM('ACTIVE', 'INACTIVE'),
    defaultValue: 'ACTIVE',
  })
  declare status: string;
}
