import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';
import { StopStatus } from '../../../common/enums';

export class UpdateTripStopStatusDto {
  @IsEnum(StopStatus)
  @IsNotEmpty()
  status: StopStatus;

  @IsOptional()
  @IsDateString()
  arrivalTime?: string;

  @IsOptional()
  @IsDateString()
  departureTime?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
