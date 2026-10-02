import { Column, DataType, Model, Table, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Trip } from './trip.model';
import { Shipment } from '../../shipments/models/shipment.model';

@Table({
  tableName: 'trip_stops',
  timestamps: true,
  underscored: true,
})
export class TripStop extends Model<TripStop> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 1,
  })
  declare sequence: number;

  @ForeignKey(() => Trip)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'trip_id',
  })
  declare tripId: string;

  @ForeignKey(() => Shipment)
  @Column({
    type: DataType.UUID,
    field: 'shipment_id',
  })
  declare shipmentId: string | null;

  @Column({
    type: DataType.ENUM('PICKUP', 'DROPOFF', 'HALT', 'CHECKPOINT'),
    defaultValue: 'PICKUP',
    field: 'stop_type',
  })
  declare stopType: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    field: 'location_name',
  })
  declare locationName: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare city: string;

  @Column({
    type: DataType.STRING(20),
  })
  declare pincode: string | null;

  @Column({
    type: DataType.ENUM('PENDING', 'ARRIVED', 'COMPLETED', 'SKIPPED'),
    defaultValue: 'PENDING',
  })
  declare status: string;

  @Column({
    type: DataType.DATE,
    field: 'arrival_time',
  })
  declare arrivalTime: Date | null;

  @Column({
    type: DataType.DATE,
    field: 'departure_time',
  })
  declare departureTime: Date | null;

  @Column({
    type: DataType.STRING(255),
  })
  declare remarks: string | null;

  @BelongsTo(() => Trip)
  declare trip: Trip;

  @BelongsTo(() => Shipment)
  declare shipment: Shipment;
}
