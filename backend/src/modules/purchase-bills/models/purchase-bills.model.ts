import { Column, DataType, Model, Table, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Carrier } from '../../carriers/models/carrier.model';

@Table({
  tableName: 'purchase_bills',
  timestamps: true,
  underscored: true,
})
export class PurchaseBill extends Model<PurchaseBill> {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.UUID, allowNull: false, field: 'organization_id' })
  declare organizationId: string;

  @ForeignKey(() => Carrier)
  @Column({ type: DataType.UUID,   field: 'carrier_id' })
  declare carrierId: string | null;

  @Column({ type: DataType.FLOAT, allowNull: false,  field: 'amount' })
  declare amount: number;

  @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'PENDING', field: 'status' })
  declare status: string;

  @Column({ type: DataType.DATE,   field: 'due_date' })
  declare dueDate: Date | null;

  @BelongsTo(() => Carrier)
  declare carrier: Carrier;

}
