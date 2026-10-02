import { IsUUID, IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateVehicleLocationDto {
  @IsUUID()
  vehicleId: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsNumber()
  speed?: number;

  @IsOptional()
  @IsNumber()
  heading?: number;

  @IsDateString()
  recordedAt: string;

  @IsOptional()
  @IsString()
  source?: string;
}
