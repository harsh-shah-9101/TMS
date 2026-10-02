import { Column, DataType, Model, Table, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Vehicle } from '../../vehicles/models/vehicle.model';
import { Driver } from '../../drivers/models/driver.model';

@Table({
  tableName: 'compliance_documents',
  timestamps: true,
  underscored: true,
})
export class ComplianceDocument extends Model<ComplianceDocument> {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.UUID, allowNull: false, field: 'organization_id' })
  declare organizationId: string;

  @ForeignKey(() => Vehicle)
  @Column({ type: DataType.UUID,   field: 'vehicle_id' })
  declare vehicleId: string | null;

  @ForeignKey(() => Driver)
  @Column({ type: DataType.UUID,   field: 'driver_id' })
  declare driverId: string | null;

  @Column({ type: DataType.STRING, allowNull: false,  field: 'type' })
  declare type: string;

  @Column({ type: DataType.DATE, allowNull: false,  field: 'expiry_date' })
  declare expiryDate: Date;

  @Column({ type: DataType.STRING,   field: 'document_url' })
  declare documentUrl: string | null;

  @BelongsTo(() => Vehicle)
  declare vehicle: Vehicle;

  @BelongsTo(() => Driver)
  declare driver: Driver;

}
