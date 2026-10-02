import { IsOptional, IsUUID, IsString, IsNumber, IsDateString, IsNumberString } from 'class-validator';

export class CreateTyreDto {
  @IsUUID()
  vehicleId: string;

  @IsString()
  serialNumber: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsString()
  status: string;

}
