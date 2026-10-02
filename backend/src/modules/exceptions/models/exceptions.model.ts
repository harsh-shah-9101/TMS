import { Column, DataType, Model, Table, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Vehicle } from '../../vehicles/models/vehicle.model';
import { Trip } from '../../trips/models/trip.model';

@Table({
  tableName: 'exceptions',
  timestamps: true,
  underscored: true,
})
export class ExceptionRecord extends Model<ExceptionRecord> {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.UUID, allowNull: false, field: 'organization_id' })
  declare organizationId: string;

  @ForeignKey(() => Trip)
  @Column({ type: DataType.UUID,   field: 'trip_id' })
  declare tripId: string | null;

  @ForeignKey(() => Vehicle)
  @Column({ type: DataType.UUID,   field: 'vehicle_id' })
  declare vehicleId: string | null;

  @Column({ type: DataType.STRING, allowNull: false,  field: 'type' })
  declare type: string;

  @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'LOW', field: 'severity' })
  declare severity: string;

  @Column({ type: DataType.STRING,   field: 'description' })
  declare description: string | null;

  @BelongsTo(() => Trip)
  declare trip: Trip;

  @BelongsTo(() => Vehicle)
  declare vehicle: Vehicle;

}
