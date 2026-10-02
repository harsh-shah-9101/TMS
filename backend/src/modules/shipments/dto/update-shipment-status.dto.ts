import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ShipmentStatus } from '../../../common/enums';

export class UpdateShipmentStatusDto {
  @ApiProperty({
    enum: ShipmentStatus,
    description: 'Target status (DRAFT, CREATED, VALIDATED, PLANNED, ASSIGNED, IN_TRANSIT, DELIVERED, CANCELLED)',
  })
  @IsEnum(ShipmentStatus)
  @IsNotEmpty()
  status: ShipmentStatus;
}
