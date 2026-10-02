import { Column, DataType, Model, Table, HasMany } from 'sequelize-typescript';
import { User } from '../../users/models/user.model';

export enum RoleName {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  TRANSPORT_MANAGER = 'TRANSPORT_MANAGER',
  DISPATCHER = 'DISPATCHER',
  FLEET_MANAGER = 'FLEET_MANAGER',
  ACCOUNTS = 'ACCOUNTS',
  DRIVER = 'DRIVER',
  VIEWER = 'VIEWER',
}

@Table({
  tableName: 'roles',
  timestamps: true,
  underscored: true,
})
export class Role extends Model<Role> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.ENUM(...Object.values(RoleName)),
    allowNull: false,
    unique: true,
  })
  name: RoleName;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  description: string;

  @HasMany(() => User)
  users: User[];
}
