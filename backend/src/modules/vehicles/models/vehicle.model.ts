import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'vehicles',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class Vehicle extends Model<Vehicle> {
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
    field: 'registration_number',
  })
  declare registrationNumber: string;

  @Column({
    type: DataType.ENUM('AVAILABLE', 'ASSIGNED', 'IN_TRANSIT', 'MAINTENANCE', 'OUT_OF_SERVICE'),
    defaultValue: 'AVAILABLE',
  })
  declare status: string;
}
