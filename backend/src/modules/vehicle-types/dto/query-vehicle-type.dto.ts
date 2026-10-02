import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { VehicleTypeStatus, FuelType } from '../../../common/enums';

export class QueryVehicleTypeDto {
  @ApiPropertyOptional({ description: 'Search term for name or code' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: VehicleTypeStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(VehicleTypeStatus)
  status?: VehicleTypeStatus;

  @ApiPropertyOptional({ enum: FuelType, description: 'Filter by fuel type' })
  @IsOptional()
  @IsEnum(FuelType)
  fuelType?: FuelType;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
