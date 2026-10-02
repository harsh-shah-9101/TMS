import { Column, DataType, Model, Table, BelongsTo, ForeignKey, HasMany } from 'sequelize-typescript';
import { Route } from '../../routes/models/route.model';
import { Vehicle } from '../../vehicles/models/vehicle.model';
import { Driver } from '../../drivers/models/driver.model';
import { Carrier } from '../../carriers/models/carrier.model';
import { TripStop } from './trip-stop.model';

@Table({
  tableName: 'trips',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class Trip extends Model<Trip> {
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
    field: 'trip_number',
  })
  declare tripNumber: string;

  @ForeignKey(() => Route)
  @Column({
    type: DataType.UUID,
    field: 'route_id',
  })
  declare routeId: string | null;

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

  @ForeignKey(() => Carrier)
  @Column({
    type: DataType.UUID,
    field: 'carrier_id',
  })
  declare carrierId: string | null;

  @Column({
    type: DataType.ENUM('PLANNED', 'ASSIGNED', 'DISPATCHED', 'IN_TRANSIT', 'PAUSED', 'COMPLETED', 'CANCELLED'),
    defaultValue: 'PLANNED',
  })
  declare status: string;

  @Column({
    type: DataType.DATE,
    field: 'planned_start_date',
  })
  declare plannedStartDate: Date | null;

  @Column({
    type: DataType.DATE,
    field: 'planned_end_date',
  })
  declare plannedEndDate: Date | null;

  @Column({
    type: DataType.DATE,
    field: 'actual_start_date',
  })
  declare actualStartDate: Date | null;

  @Column({
    type: DataType.DATE,
    field: 'actual_end_date',
  })
  declare actualEndDate: Date | null;

  @Column({
    type: DataType.FLOAT,
    field: 'start_odometer',
  })
  declare startOdometer: number | null;

  @Column({
    type: DataType.FLOAT,
    field: 'end_odometer',
  })
  declare endOdometer: number | null;

  @Column({
    type: DataType.STRING(255),
  })
  declare remarks: string | null;

  @BelongsTo(() => Route)
  declare route: Route;

  @BelongsTo(() => Vehicle)
  declare vehicle: Vehicle;

  @BelongsTo(() => Driver)
  declare driver: Driver;

  @BelongsTo(() => Carrier)
  declare carrier: Carrier;

  @HasMany(() => TripStop)
  declare stops: TripStop[];
}
