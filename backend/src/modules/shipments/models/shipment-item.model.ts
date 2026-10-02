import { Column, DataType, Model, Table, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Shipment } from './shipment.model';

@Table({
  tableName: 'shipment_items',
  timestamps: true,
  underscored: true,
})
export class ShipmentItem extends Model<ShipmentItem> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Shipment)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'shipment_id',
  })
  declare shipmentId: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare description: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 1,
  })
  declare quantity: number;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
    field: 'weight_kg',
  })
  declare weightKg: number;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
    field: 'volume_cu_ft',
  })
  declare volumeCuFt: number;

  @Column({
    type: DataType.FLOAT,
    field: 'declared_value',
  })
  declare declaredValue: number | null;

  @BelongsTo(() => Shipment)
  declare shipment: Shipment;
}
