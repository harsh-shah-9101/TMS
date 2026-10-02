import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'vehicle_types',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class VehicleType extends Model<VehicleType> {
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
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  declare code: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
    field: 'capacity_tons',
  })
  declare capacityTons?: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
    field: 'volume_cu_ft',
  })
  declare volumeCuFt?: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'axle_count',
  })
  declare axleCount?: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'fuel_type',
  })
  declare fuelType?: string;

  @Column({
    type: DataType.STRING(50),
    defaultValue: 'ACTIVE',
  })
  declare status?: string;
}
