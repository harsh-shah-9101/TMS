import { IsOptional, IsUUID, IsString, IsNumber, IsDateString, IsNumberString } from 'class-validator';

export class CreateMaintenanceRecordDto {
  @IsUUID()
  vehicleId: string;

  @IsDateString()
  date: string;

  @IsNumber()
  cost: number;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  description?: string;

}
