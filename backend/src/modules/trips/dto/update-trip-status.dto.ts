import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TripStatus } from '@prisma/client';

export class UpdateTripStatusDto {
  @IsEnum(TripStatus)
  @IsNotEmpty()
  status: TripStatus;

  @IsOptional()
  @IsString()
  remarks?: string;
}
