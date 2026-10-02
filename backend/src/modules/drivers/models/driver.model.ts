import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from '../../users/models/user.model';

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
    type: DataType.STRING(20),
    allowNull: true,
  })
  declare phone: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'license_number',
  })
  declare licenseNumber: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
    field: 'license_category',
  })
  declare licenseCategory: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    field: 'license_expiry',
  })
  declare licenseExpiry: Date;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    field: 'user_id',
  })
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.STRING(50),
    defaultValue: 'AVAILABLE',
  })
  declare status: string;
}
