import { Column, DataType, Model, Table, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Vehicle } from '../../vehicles/models/vehicle.model';

@Table({
  tableName: 'tyres',
  timestamps: true,
  underscored: true,
})
export class Tyre extends Model<Tyre> {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.UUID, allowNull: false, field: 'organization_id' })
  declare organizationId: string;

  @ForeignKey(() => Vehicle)
  @Column({ type: DataType.UUID, allowNull: false,  field: 'vehicle_id' })
  declare vehicleId: string;

  @Column({ type: DataType.STRING, allowNull: false,  field: 'serial_number' })
  declare serialNumber: string;

  @Column({ type: DataType.STRING,   field: 'position' })
  declare position: string | null;

  @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'ACTIVE', field: 'status' })
  declare status: string;

  @BelongsTo(() => Vehicle)
  declare vehicle: Vehicle;

}
