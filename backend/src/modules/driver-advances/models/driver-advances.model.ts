import { Column, DataType, Model, Table, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Driver } from '../../drivers/models/driver.model';
import { Trip } from '../../trips/models/trip.model';

@Table({
  tableName: 'driver_advances',
  timestamps: true,
  underscored: true,
})
export class DriverAdvance extends Model<DriverAdvance> {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.UUID, allowNull: false, field: 'organization_id' })
  declare organizationId: string;

  @ForeignKey(() => Driver)
  @Column({ type: DataType.UUID, allowNull: false,  field: 'driver_id' })
  declare driverId: string;

  @ForeignKey(() => Trip)
  @Column({ type: DataType.UUID,   field: 'trip_id' })
  declare tripId: string | null;

  @Column({ type: DataType.FLOAT, allowNull: false,  field: 'amount' })
  declare amount: number;

  @Column({ type: DataType.DATE, allowNull: false,  field: 'date' })
  declare date: Date;

  @Column({ type: DataType.STRING,   field: 'reason' })
  declare reason: string | null;

  @BelongsTo(() => Driver)
  declare driver: Driver;

  @BelongsTo(() => Trip)
  declare trip: Trip;

}
