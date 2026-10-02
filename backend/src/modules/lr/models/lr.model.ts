import { Column, DataType, Model, Table, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Shipment } from '../../shipments/models/shipment.model';

@Table({
  tableName: 'lorry_receipts',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class LorryReceipt extends Model<LorryReceipt> {
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

  @ForeignKey(() => Shipment)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'shipment_id',
  })
  declare shipmentId: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'lr_number',
  })
  declare lrNumber: string;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    field: 'lr_date',
  })
  declare lrDate: Date;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'consignor_name',
  })
  declare consignorName: string;

  @Column({
    type: DataType.STRING(255),
    field: 'consignor_address',
  })
  declare consignorAddress: string | null;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'consignee_name',
  })
  declare consigneeName: string;

  @Column({
    type: DataType.STRING(255),
    field: 'consignee_address',
  })
  declare consigneeAddress: string | null;

  @Column({
    type: DataType.ENUM('PAID', 'TO_PAY', 'TO_BE_BILLED'),
    defaultValue: 'TO_PAY',
    field: 'freight_terms',
  })
  declare freightTerms: string;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
    field: 'basic_freight',
  })
  declare basicFreight: number;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
    field: 'other_charges',
  })
  declare otherCharges: number;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
    field: 'tax_amount',
  })
  declare taxAmount: number;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
    field: 'total_amount',
  })
  declare totalAmount: number;

  @Column({
    type: DataType.STRING(255),
  })
  declare remarks: string | null;

  @Column({
    type: DataType.ENUM('ISSUED', 'CANCELLED'),
    defaultValue: 'ISSUED',
  })
  declare status: string;

  @BelongsTo(() => Shipment)
  declare shipment: Shipment;
}
