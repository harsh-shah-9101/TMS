import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { RouteStatus } from '../../../common/enums';

export class QueryRouteDto {
  @ApiPropertyOptional({ description: 'Search term for name, code, origin, or destination' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: RouteStatus, description: 'Filter by route status' })
  @IsOptional()
  @IsEnum(RouteStatus)
  status?: RouteStatus;

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
