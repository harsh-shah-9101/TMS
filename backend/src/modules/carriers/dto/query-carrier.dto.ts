import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CarrierStatus } from '../../../common/enums';

export class QueryCarrierDto {
  @ApiPropertyOptional({ description: 'Search term for name, code, GSTIN, city, or phone' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: CarrierStatus, description: 'Filter by carrier status (ACTIVE, INACTIVE, BLACKLISTED)' })
  @IsOptional()
  @IsEnum(CarrierStatus)
  status?: CarrierStatus;

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
