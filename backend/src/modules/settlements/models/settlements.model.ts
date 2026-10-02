import { Column, DataType, Model, Table, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Driver } from '../../drivers/models/driver.model';
import { Carrier } from '../../carriers/models/carrier.model';

@Table({
  tableName: 'settlements',
  timestamps: true,
  underscored: true,
})
export class Settlement extends Model<Settlement> {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.UUID, allowNull: false, field: 'organization_id' })
  declare organizationId: string;

  @ForeignKey(() => Driver)
  @Column({ type: DataType.UUID,   field: 'driver_id' })
  declare driverId: string | null;

  @ForeignKey(() => Carrier)
  @Column({ type: DataType.UUID,   field: 'carrier_id' })
  declare carrierId: string | null;

  @Column({ type: DataType.FLOAT, allowNull: false,  field: 'amount' })
  declare amount: number;

  @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'PENDING', field: 'status' })
  declare status: string;

  @BelongsTo(() => Driver)
  declare driver: Driver;

  @BelongsTo(() => Carrier)
  declare carrier: Carrier;

}
