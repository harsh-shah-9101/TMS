import { Column, DataType, Model, Table, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Trip } from '../../trips/models/trip.model';
import { Shipment } from '../../shipments/models/shipment.model';

@Table({
  tableName: 'pods',
  timestamps: true,
  underscored: true,
})
export class Pod extends Model<Pod> {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.UUID, allowNull: false, field: 'organization_id' })
  declare organizationId: string;

  @ForeignKey(() => Shipment)
  @Column({ type: DataType.UUID, allowNull: false,  field: 'shipment_id' })
  declare shipmentId: string;

  @ForeignKey(() => Trip)
  @Column({ type: DataType.UUID, allowNull: false,  field: 'trip_id' })
  declare tripId: string;

  @Column({ type: DataType.STRING,   field: 'received_by' })
  declare receivedBy: string | null;

  @Column({ type: DataType.STRING,   field: 'signature_url' })
  declare signatureUrl: string | null;

  @Column({ type: DataType.FLOAT,   field: 'shortage_qty' })
  declare shortageQty: number | null;

  @BelongsTo(() => Shipment)
  declare shipment: Shipment;

  @BelongsTo(() => Trip)
  declare trip: Trip;

}
