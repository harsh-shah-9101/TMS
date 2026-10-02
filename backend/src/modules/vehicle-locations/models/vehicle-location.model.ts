import { Column, DataType, Model, Table, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Vehicle } from '../../vehicles/models/vehicle.model';

@Table({
  tableName: 'vehicle_locations',
  timestamps: true,
  updatedAt: false,
  paranoid: false,
  underscored: true,
  indexes: [
    { fields: ['organization_id'] },
    { fields: ['vehicle_id'] },
    { fields: ['recorded_at'] },
  ],
})
export class VehicleLocation extends Model<VehicleLocation> {
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

  @ForeignKey(() => Vehicle)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'vehicle_id',
  })
  declare vehicleId: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  declare latitude: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  declare longitude: number;

  @Column({
    type: DataType.FLOAT,
  })
  declare speed: number | null;

  @Column({
    type: DataType.FLOAT,
  })
  declare heading: number | null;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'recorded_at',
  })
  declare recordedAt: Date;

  @Column({
    type: DataType.STRING(50),
    defaultValue: 'GPS_DEVICE',
  })
  declare source: string;

  @BelongsTo(() => Vehicle)
  declare vehicle: Vehicle;
}
