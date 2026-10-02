import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsUUID,
  Min,
} from 'class-validator';
import { StopType, StopStatus } from '../../../common/enums';

export class CreateTripStopDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  sequence?: number;

  @IsOptional()
  @IsUUID()
  shipmentId?: string;

  @IsOptional()
  @IsEnum(StopType)
  stopType?: StopType;

  @IsString()
  @IsNotEmpty()
  locationName: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsEnum(StopStatus)
  status?: StopStatus;

  @IsOptional()
  @IsString()
  remarks?: string;
}
