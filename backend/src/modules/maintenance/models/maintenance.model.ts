import { Column, DataType, Model, Table, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Vehicle } from '../../vehicles/models/vehicle.model';

@Table({
  tableName: 'maintenance_records',
  timestamps: true,
  underscored: true,
})
export class MaintenanceRecord extends Model<MaintenanceRecord> {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.UUID, allowNull: false, field: 'organization_id' })
  declare organizationId: string;

  @ForeignKey(() => Vehicle)
  @Column({ type: DataType.UUID, allowNull: false,  field: 'vehicle_id' })
  declare vehicleId: string;

  @Column({ type: DataType.DATE, allowNull: false,  field: 'date' })
  declare date: Date;

  @Column({ type: DataType.FLOAT, allowNull: false,  field: 'cost' })
  declare cost: number;

  @Column({ type: DataType.STRING, allowNull: false,  field: 'type' })
  declare type: string;

  @Column({ type: DataType.STRING,   field: 'description' })
  declare description: string | null;

  @BelongsTo(() => Vehicle)
  declare vehicle: Vehicle;

}
