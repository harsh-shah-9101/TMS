import { Column, DataType, Model, Table, HasMany } from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
// other hasMany associations like Vehicles, Drivers, etc. can be added later

export enum OrganizationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Table({
  tableName: 'organizations',
  timestamps: true,
  underscored: true,
  paranoid: true,
})
export class Organization extends Model<Organization> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  declare code: string;

  @Column({
    type: DataType.ENUM(...Object.values(OrganizationStatus)),
    defaultValue: OrganizationStatus.ACTIVE,
  })
  declare status?: OrganizationStatus;

  @HasMany(() => User)
  declare users?: User[];
}
