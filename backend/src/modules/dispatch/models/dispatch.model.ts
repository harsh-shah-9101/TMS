import { Column, DataType, Model, Table, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Trip } from '../../trips/models/trip.model';

@Table({
  tableName: 'dispatches',
  timestamps: true,
  underscored: true,
})
export class Dispatch extends Model<Dispatch> {
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
    allowNull: false,
    field: 'trip_id',
  })
  declare tripId: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: 'dispatch_number',
  })
  declare dispatchNumber: string;

  @Column({
    type: DataType.STRING(50),
    field: 'gate_pass_number',
  })
  declare gatePassNumber: string | null;

  @Column({
    type: DataType.ENUM('DISPATCHED', 'GATE_OUT', 'CANCELLED'),
    defaultValue: 'DISPATCHED',
  })
  declare status: string;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
    field: 'dispatched_at',
  })
  declare dispatchedAt: Date;

  @Column({
    type: DataType.UUID,
    field: 'dispatched_by_user_id',
  })
  declare dispatchedByUserId: string | null;

  @Column({
    type: DataType.STRING(255),
  })
  declare remarks: string | null;

  @BelongsTo(() => Trip)
  declare trip: Trip;
}
