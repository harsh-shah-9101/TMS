import { IsOptional, IsUUID, IsString, IsNumber, IsDateString, IsNumberString } from 'class-validator';

export class CreateInvoiceDto {
  @IsUUID()
  customerId: string;

  @IsNumber()
  amount: number;

  @IsString()
  status: string;

  @IsDateString()
  dueDate: string;

}
