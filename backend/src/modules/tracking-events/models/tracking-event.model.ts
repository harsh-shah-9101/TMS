import { Column, DataType, Model, Table, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Trip } from '../../trips/models/trip.model';
import { Vehicle } from '../../vehicles/models/vehicle.model';
import { Driver } from '../../drivers/models/driver.model';
import { Shipment } from '../../shipments/models/shipment.model';

@Table({
  tableName: 'tracking_events',
  timestamps: true,
  updatedAt: false,
  paranoid: false,
  underscored: true,
  indexes: [
    { fields: ['organization_id'] },
    { fields: ['trip_id'] },
    { fields: ['vehicle_id'] },
    { fields: ['event_time'] },
  ],
})
export class TrackingEvent extends Model<TrackingEvent> {
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

  @ForeignKey(() => Trip)
  @Column({
    type: DataType.UUID,
    field: 'trip_id',
  })
  declare tripId: string | null;

  @ForeignKey(() => Vehicle)
  @Column({
    type: DataType.UUID,
    field: 'vehicle_id',
  })
  declare vehicleId: string | null;

  @ForeignKey(() => Driver)
  @Column({
    type: DataType.UUID,
    field: 'driver_id',
  })
  declare driverId: string | null;

  @ForeignKey(() => Shipment)
  @Column({
    type: DataType.UUID,
    field: 'shipment_id',
  })
  declare shipmentId: string | null;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'event_type',
  })
  declare eventType: string;

  @Column({
    type: DataType.STRING(255),
  })
  declare description: string | null;

  @Column({
    type: DataType.FLOAT,
  })
  declare latitude: number | null;

  @Column({
    type: DataType.FLOAT,
  })
  declare longitude: number | null;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'event_time',
  })
  declare eventTime: Date;

  @Column({
    type: DataType.JSONB,
  })
  declare metadata: any | null;

  @Column({
    type: DataType.STRING(50),
    defaultValue: 'SYSTEM',
  })
  declare source: string;

  @BelongsTo(() => Trip)
  declare trip: Trip;

  @BelongsTo(() => Vehicle)
  declare vehicle: Vehicle;
}
