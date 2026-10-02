import { IsOptional, IsUUID, IsString, IsNumber, IsDateString, IsNumberString } from 'class-validator';

export class CreateSettlementDto {
  @IsOptional()
  @IsUUID()
  driverId?: string;

  @IsOptional()
  @IsUUID()
  carrierId?: string;

  @IsNumber()
  amount: number;

  @IsString()
  status: string;

}
