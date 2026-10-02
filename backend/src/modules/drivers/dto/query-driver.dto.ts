import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DriverStatus } from '@prisma/client';

export class QueryDriverDto {
  @ApiPropertyOptional({ description: 'Search term for first name, last name, phone, or license number' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: DriverStatus, description: 'Filter by driver operational status' })
  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;

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
