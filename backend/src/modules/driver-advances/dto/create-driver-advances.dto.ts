import { IsOptional, IsUUID, IsString, IsNumber, IsDateString, IsNumberString } from 'class-validator';

export class CreateDriverAdvanceDto {
  @IsUUID()
  driverId: string;

  @IsOptional()
  @IsUUID()
  tripId?: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  reason?: string;

}
