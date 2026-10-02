import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { OwnershipType, VehicleStatus } from '@prisma/client';

export class CreateVehicleDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'ID of the vehicle type' })
  @IsUUID('4', { message: 'vehicleTypeId must be a valid UUID' })
  @IsNotEmpty()
  vehicleTypeId: string;

  @ApiProperty({ example: 'MH12AB1234', description: 'Vehicle registration number (unique per organization)' })
  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @ApiPropertyOptional({ example: 'MAT625000K1234567', description: 'Chassis number' })
  @IsOptional()
  @IsString()
  chassisNumber?: string;

  @ApiPropertyOptional({ example: 'ENG98765432', description: 'Engine number' })
  @IsOptional()
  @IsString()
  engineNumber?: string;

  @ApiPropertyOptional({ example: 'Tata Motors', description: 'Manufacturer / Make' })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiPropertyOptional({ example: 'Prima 5530.S', description: 'Vehicle model' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ example: 2024, description: 'Manufacturing year' })
  @IsOptional()
  @IsInt()
  @Min(1990)
  @Max(new Date().getFullYear() + 1)
  year?: number;

  @ApiPropertyOptional({
    enum: VehicleStatus,
    default: VehicleStatus.AVAILABLE,
    description: 'Vehicle operational status',
  })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @ApiPropertyOptional({
    enum: OwnershipType,
    default: OwnershipType.OWNED,
    description: 'Vehicle ownership classification',
  })
  @IsOptional()
  @IsEnum(OwnershipType)
  ownershipType?: OwnershipType;

  @ApiPropertyOptional({ example: 12500.5, default: 0, description: 'Current odometer reading in km' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentOdometer?: number;
}
