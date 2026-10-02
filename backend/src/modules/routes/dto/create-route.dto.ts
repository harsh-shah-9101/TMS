import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { RouteStatus } from '@prisma/client';

export class CreateRouteDto {
  @ApiProperty({ example: 'Mumbai to Bengaluru Express Corridor', description: 'Route display name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'RT-MUM-BLR', description: 'Unique route code within organization' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Mumbai', description: 'Origin city' })
  @IsString()
  @IsNotEmpty()
  originCity: string;

  @ApiPropertyOptional({ example: 'Maharashtra', description: 'Origin state' })
  @IsOptional()
  @IsString()
  originState?: string;

  @ApiProperty({ example: 'Bengaluru', description: 'Destination city' })
  @IsString()
  @IsNotEmpty()
  destinationCity: string;

  @ApiPropertyOptional({ example: 'Karnataka', description: 'Destination state' })
  @IsOptional()
  @IsString()
  destinationState?: string;

  @ApiPropertyOptional({ example: 980.5, default: 0, description: 'Route distance in kilometers' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  distanceKm?: number;

  @ApiPropertyOptional({ example: 22.5, default: 0, description: 'Estimated transit duration in hours' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedHours?: number;

  @ApiPropertyOptional({
    enum: RouteStatus,
    default: RouteStatus.ACTIVE,
    description: 'Route operational status',
  })
  @IsOptional()
  @IsEnum(RouteStatus)
  status?: RouteStatus;
}
