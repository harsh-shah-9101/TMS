import { Column, DataType, Model, Table, HasMany, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { ShipmentItem } from './shipment-item.model';
import { Customer } from '../../customers/models/customer.model';

@Table({
  tableName: 'shipments',
  timestamps: true,
  paranoid: true, // Enables soft deletes using deletedAt
  underscored: true,
})
export class Shipment extends Model<Shipment> {
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

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'booking_number',
  })
  declare bookingNumber: string;

  @ForeignKey(() => Customer)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'customer_id',
  })
  declare customerId: string;

  @ForeignKey(() => Customer)
  @Column({
    type: DataType.UUID,
    field: 'consignee_id',
  })
  declare consigneeId: string | null;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'origin_city',
  })
  declare originCity: string;

  @Column({
    type: DataType.STRING(20),
    field: 'origin_pincode',
  })
  declare originPincode: string | null;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'destination_city',
  })
  declare destinationCity: string;

  @Column({
    type: DataType.STRING(20),
    field: 'destination_pincode',
  })
  declare destinationPincode: string | null;

  @Column({
    type: DataType.DATE,
    field: 'pickup_date',
  })
  declare pickupDate: Date | null;

  @Column({
    type: DataType.DATE,
    field: 'expected_delivery_date',
  })
  declare expectedDeliveryDate: Date | null;

  @Column({
    type: DataType.ENUM(
      'DRAFT',
      'CREATED',
      'VALIDATED',
      'PLANNED',
      'ASSIGNED',
      'IN_TRANSIT',
      'DELIVERED',
      'CANCELLED'
    ),
    defaultValue: 'CREATED',
  })
  declare status: string;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
    field: 'total_weight_kg',
  })
  declare totalWeightKg: number;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
    field: 'total_volume_cu_ft',
  })
  declare totalVolumeCuFt: number;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
    field: 'freight_amount',
  })
  declare freightAmount: number;

  @HasMany(() => ShipmentItem, { foreignKey: 'shipmentId', as: 'items' })
  declare items: ShipmentItem[];

  @BelongsTo(() => Customer, { foreignKey: 'customerId', as: 'customer' })
  declare customer: Customer;

  @BelongsTo(() => Customer, { foreignKey: 'consigneeId', as: 'consignee' })
  declare consignee: Customer | null;
}
