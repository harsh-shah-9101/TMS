import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TripStatus } from '../../../common/enums';

export class UpdateTripStatusDto {
  @IsEnum(TripStatus)
  @IsNotEmpty()
  status: TripStatus;

  @IsOptional()
  @IsString()
  remarks?: string;
}
