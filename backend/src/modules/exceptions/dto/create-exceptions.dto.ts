import { IsOptional, IsUUID, IsString, IsNumber, IsDateString, IsNumberString } from 'class-validator';

export class CreateExceptionRecordDto {
  @IsOptional()
  @IsUUID()
  tripId?: string;

  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @IsString()
  type: string;

  @IsString()
  severity: string;

  @IsOptional()
  @IsString()
  description?: string;

}
