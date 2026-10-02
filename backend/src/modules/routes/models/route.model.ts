import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'routes',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class Route extends Model<Route> {
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
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  declare code: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'origin_city',
  })
  declare originCity: string;

  @Column({
    type: DataType.STRING(100),
    field: 'origin_state',
  })
  declare originState: string | null;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'destination_city',
  })
  declare destinationCity: string;

  @Column({
    type: DataType.STRING(100),
    field: 'destination_state',
  })
  declare destinationState: string | null;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
    field: 'distance_km',
  })
  declare distanceKm: number;

  @Column({
    type: DataType.FLOAT,
    defaultValue: 0,
    field: 'estimated_hours',
  })
  declare estimatedHours: number;

  @Column({
    type: DataType.ENUM('ACTIVE', 'INACTIVE'),
    defaultValue: 'ACTIVE',
  })
  declare status: string;
}
