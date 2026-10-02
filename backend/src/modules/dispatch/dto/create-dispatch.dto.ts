import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { DispatchStatus } from '@prisma/client';

export class CreateDispatchDto {
  @IsUUID()
  @IsNotEmpty()
  tripId: string;

  @IsString()
  @IsNotEmpty()
  dispatchNumber: string;

  @IsOptional()
  @IsString()
  gatePassNumber?: string;

  @IsOptional()
  @IsEnum(DispatchStatus)
  status?: DispatchStatus;

  @IsOptional()
  @IsString()
  remarks?: string;
}
