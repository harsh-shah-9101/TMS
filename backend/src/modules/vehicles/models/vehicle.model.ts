import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { VehicleType } from '../../vehicle-types/models/vehicle-types.model';

@Table({
  tableName: 'vehicles',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class Vehicle extends Model<Vehicle> {
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

  @ForeignKey(() => VehicleType)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'vehicle_type_id',
  })
  declare vehicleTypeId: string;

  @BelongsTo(() => VehicleType)
  declare vehicleType: VehicleType;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'registration_number',
  })
  declare registrationNumber: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: 'chassis_number',
  })
  declare chassisNumber?: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: 'engine_number',
  })
  declare engineNumber?: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  declare make?: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  declare model?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare year?: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'ownership_type',
  })
  declare ownershipType?: string;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
    field: 'current_odometer',
  })
  declare currentOdometer?: number;

  @Column({
    type: DataType.STRING(50),
    defaultValue: 'AVAILABLE',
  })
  declare status?: string;
}
