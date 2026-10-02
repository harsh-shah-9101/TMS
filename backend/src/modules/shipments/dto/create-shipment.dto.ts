import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ShipmentStatus } from '../../../common/enums';
import { CreateShipmentItemDto } from './create-shipment-item.dto';

export class CreateShipmentDto {
  @ApiProperty({ example: 'BK-2026-0001', description: 'Booking reference number (unique per organization)' })
  @IsString()
  @IsNotEmpty()
  bookingNumber: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Customer / Shipper ID' })
  @IsUUID('4')
  @IsNotEmpty()
  customerId: string;

  @ApiPropertyOptional({ example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', description: 'Consignee / Receiver Customer ID' })
  @IsOptional()
  @IsUUID('4')
  consigneeId?: string;

  @ApiProperty({ example: 'Mumbai', description: 'Origin city' })
  @IsString()
  @IsNotEmpty()
  originCity: string;

  @ApiPropertyOptional({ example: '400001', description: 'Origin pincode' })
  @IsOptional()
  @IsString()
  originPincode?: string;

  @ApiProperty({ example: 'Bengaluru', description: 'Destination city' })
  @IsString()
  @IsNotEmpty()
  destinationCity: string;

  @ApiPropertyOptional({ example: '560001', description: 'Destination pincode' })
  @IsOptional()
  @IsString()
  destinationPincode?: string;

  @ApiPropertyOptional({ example: '2026-10-05T10:00:00.000Z', description: 'Pickup schedule date' })
  @IsOptional()
  @IsDateString()
  pickupDate?: string;

  @ApiPropertyOptional({ example: '2026-10-08T18:00:00.000Z', description: 'Expected delivery date' })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @ApiPropertyOptional({
    enum: ShipmentStatus,
    default: ShipmentStatus.CREATED,
    description: 'Initial status (DRAFT, CREATED, VALIDATED)',
  })
  @IsOptional()
  @IsEnum(ShipmentStatus)
  status?: ShipmentStatus;

  @ApiPropertyOptional({ example: 45000.0, default: 0, description: 'Agreed freight amount in INR' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  freightAmount?: number;

  @ApiPropertyOptional({ type: [CreateShipmentItemDto], description: 'List of shipment items' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateShipmentItemDto)
  items?: CreateShipmentItemDto[];
}
