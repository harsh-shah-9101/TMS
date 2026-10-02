import { IsOptional, IsUUID, IsString, IsNumber, IsDateString, IsNumberString } from 'class-validator';

export class CreatePodDto {
  @IsUUID()
  shipmentId: string;

  @IsUUID()
  tripId: string;

  @IsOptional()
  @IsString()
  receivedBy?: string;

  @IsOptional()
  @IsString()
  signatureUrl?: string;

  @IsOptional()
  @IsNumber()
  shortageQty?: number;

}
