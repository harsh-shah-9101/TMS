import { IsOptional, IsString, IsEnum, IsInt, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DispatchStatus } from '../../../common/enums';

export class QueryDispatchDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(DispatchStatus)
  status?: DispatchStatus;

  @IsOptional()
  @IsUUID()
  tripId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
