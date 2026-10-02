import { IsOptional, IsUUID, IsString, IsNumber, IsDateString, IsNumberString } from 'class-validator';

export class CreateComplianceDocumentDto {
  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @IsOptional()
  @IsUUID()
  driverId?: string;

  @IsString()
  type: string;

  @IsDateString()
  expiryDate: string;

  @IsOptional()
  @IsString()
  documentUrl?: string;

}
