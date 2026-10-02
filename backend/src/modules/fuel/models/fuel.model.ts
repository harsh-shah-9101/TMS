import { Column, DataType, Model, Table, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Vehicle } from '../../vehicles/models/vehicle.model';
import { Driver } from '../../drivers/models/driver.model';

@Table({
  tableName: 'fuel_logs',
  timestamps: true,
  underscored: true,
})
export class FuelLog extends Model<FuelLog> {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.UUID, allowNull: false, field: 'organization_id' })
  declare organizationId: string;

  @ForeignKey(() => Vehicle)
  @Column({ type: DataType.UUID, allowNull: false,  field: 'vehicle_id' })
  declare vehicleId: string;

  @ForeignKey(() => Driver)
  @Column({ type: DataType.UUID,   field: 'driver_id' })
  declare driverId: string | null;

  @Column({ type: DataType.FLOAT, allowNull: false,  field: 'quantity' })
  declare quantity: number;

  @Column({ type: DataType.FLOAT, allowNull: false,  field: 'cost' })
  declare cost: number;

  @Column({ type: DataType.FLOAT,   field: 'odometer' })
  declare odometer: number | null;

  @Column({ type: DataType.DATE, allowNull: false,  field: 'date' })
  declare date: Date;

  @BelongsTo(() => Vehicle)
  declare vehicle: Vehicle;

  @BelongsTo(() => Driver)
  declare driver: Driver;

}
