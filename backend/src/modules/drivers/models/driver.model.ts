import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'drivers',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class Driver extends Model<Driver> {
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
    type: DataType.STRING(100),
    allowNull: false,
    field: 'first_name',
  })
  declare firstName: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: 'last_name',
  })
  declare lastName: string;

  @Column({
    type: DataType.ENUM('AVAILABLE', 'ASSIGNED', 'ON_TRIP', 'ON_LEAVE', 'INACTIVE'),
    defaultValue: 'AVAILABLE',
  })
  declare status: string;
}
