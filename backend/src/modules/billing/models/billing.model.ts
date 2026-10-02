import { Column, DataType, Model, Table, BelongsTo, ForeignKey } from 'sequelize-typescript';

@Table({
  tableName: 'invoices',
  timestamps: true,
  underscored: true,
})
export class Invoice extends Model<Invoice> {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.UUID, allowNull: false, field: 'organization_id' })
  declare organizationId: string;

  @Column({ type: DataType.UUID, allowNull: false,  field: 'customer_id' })
  declare customerId: string;

  @Column({ type: DataType.FLOAT, allowNull: false,  field: 'amount' })
  declare amount: number;

  @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'DRAFT', field: 'status' })
  declare status: string;

  @Column({ type: DataType.DATE, allowNull: false,  field: 'due_date' })
  declare dueDate: Date;

}
