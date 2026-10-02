import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { FreightTerm, LRStatus } from '@prisma/client';

export class QueryLrDto {
  @ApiPropertyOptional({ description: 'Search term for LR number, consignor, or consignee' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: LRStatus, description: 'Filter by LR status' })
  @IsOptional()
  @IsEnum(LRStatus)
  status?: LRStatus;

  @ApiPropertyOptional({ enum: FreightTerm, description: 'Filter by freight payment terms' })
  @IsOptional()
  @IsEnum(FreightTerm)
  freightTerms?: FreightTerm;

  @ApiPropertyOptional({ description: 'Filter by shipment ID' })
  @IsOptional()
  @IsUUID()
  shipmentId?: string;

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
