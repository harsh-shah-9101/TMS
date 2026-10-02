import { IsOptional, IsUUID, IsString, IsNumber, IsDateString, IsNumberString } from 'class-validator';

export class CreatePurchaseBillDto {
  @IsOptional()
  @IsUUID()
  carrierId?: string;

  @IsNumber()
  amount: number;

  @IsString()
  status: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

}
