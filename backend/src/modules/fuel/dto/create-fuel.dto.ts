import { IsOptional, IsUUID, IsString, IsNumber, IsDateString, IsNumberString } from 'class-validator';

export class CreateFuelLogDto {
  @IsUUID()
  vehicleId: string;

  @IsOptional()
  @IsUUID()
  driverId?: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  cost: number;

  @IsOptional()
  @IsNumber()
  odometer?: number;

  @IsDateString()
  date: string;

}
