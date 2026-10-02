import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { FuelType, VehicleTypeStatus } from '@prisma/client';

export class CreateVehicleTypeDto {
  @ApiProperty({ example: '32ft Multi-Axle Container', description: 'Name of the vehicle type' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '32MX', description: 'Unique vehicle type code within organization' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 15.5, description: 'Payload capacity in metric tons' })
  @IsNumber()
  @Min(0.1, { message: 'Capacity must be greater than 0' })
  capacityTons: number;

  @ApiPropertyOptional({ example: 1850.0, description: 'Volumetric capacity in cubic feet' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  volumeCuFt?: number;

  @ApiPropertyOptional({ example: 3, description: 'Number of axles' })
  @IsOptional()
  @IsInt()
  @Min(2)
  axleCount?: number;

  @ApiPropertyOptional({
    enum: FuelType,
    default: FuelType.DIESEL,
    description: 'Fuel type used by vehicle category',
  })
  @IsOptional()
  @IsEnum(FuelType)
  fuelType?: FuelType;

  @ApiPropertyOptional({
    enum: VehicleTypeStatus,
    default: VehicleTypeStatus.ACTIVE,
    description: 'Operational status of vehicle type',
  })
  @IsOptional()
  @IsEnum(VehicleTypeStatus)
  status?: VehicleTypeStatus;
}
