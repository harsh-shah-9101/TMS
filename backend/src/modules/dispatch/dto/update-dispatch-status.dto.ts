import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DispatchStatus } from '@prisma/client';

export class UpdateDispatchStatusDto {
  @IsEnum(DispatchStatus)
  @IsNotEmpty()
  status: DispatchStatus;

  @IsOptional()
  @IsString()
  remarks?: string;
}
