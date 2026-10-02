import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { FreightTerm, LRStatus } from '@prisma/client';

export class CreateLrDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Associated shipment ID' })
  @IsUUID('4')
  @IsNotEmpty()
  shipmentId: string;

  @ApiProperty({ example: 'LR-2026-001', description: 'Unique Lorry Receipt Number within organization' })
  @IsString()
  @IsNotEmpty()
  lrNumber: string;

  @ApiProperty({ example: 'Reliance Industries Ltd', description: 'Consignor Name' })
  @IsString()
  @IsNotEmpty()
  consignorName: string;

  @ApiPropertyOptional({ example: 'Maker Chambers IV, Nariman Point, Mumbai', description: 'Consignor Address' })
  @IsOptional()
  @IsString()
  consignorAddress?: string;

  @ApiProperty({ example: 'TCS Ltd', description: 'Consignee Name' })
  @IsString()
  @IsNotEmpty()
  consigneeName: string;

  @ApiPropertyOptional({ example: 'Electronics City, Bengaluru', description: 'Consignee Address' })
  @IsOptional()
  @IsString()
  consigneeAddress?: string;

  @ApiPropertyOptional({
    enum: FreightTerm,
    default: FreightTerm.TO_PAY,
    description: 'Freight Payment Terms (PAID, TO_PAY, TO_BE_BILLED)',
  })
  @IsOptional()
  @IsEnum(FreightTerm)
  freightTerms?: FreightTerm;

  @ApiPropertyOptional({ example: 40000.0, default: 0, description: 'Basic Freight Charge' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basicFreight?: number;

  @ApiPropertyOptional({ example: 2500.0, default: 0, description: 'Loading/Unloading & Other Charges' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  otherCharges?: number;

  @ApiPropertyOptional({ example: 2500.0, default: 0, description: 'GST / Tax Amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiPropertyOptional({ example: 'Handle with care. Temperature sensitive.', description: 'Remarks / Special Instructions' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({
    enum: LRStatus,
    default: LRStatus.ISSUED,
    description: 'LR Document Status (ISSUED, CANCELLED)',
  })
  @IsOptional()
  @IsEnum(LRStatus)
  status?: LRStatus;
}
