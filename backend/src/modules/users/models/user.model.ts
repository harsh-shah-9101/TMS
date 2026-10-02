import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Organization } from '../../organizations/models/organization.model';
import { Role } from '../../roles/models/role.model';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
  paranoid: true,
})
export class User extends Model<User> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => Organization)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare organizationId: string;

  @BelongsTo(() => Organization)
  declare organization?: Organization;

  @ForeignKey(() => Role)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare roleId: string;

  @BelongsTo(() => Role)
  declare role?: Role;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare firstName: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare lastName: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  declare phone?: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserStatus)),
    defaultValue: UserStatus.ACTIVE,
  })
  declare status?: UserStatus;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare refreshToken?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare lastLoginAt?: Date;
}
