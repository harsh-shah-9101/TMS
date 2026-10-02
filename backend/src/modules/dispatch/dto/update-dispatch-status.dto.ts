import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DispatchStatus } from '../../../common/enums';

export class UpdateDispatchStatusDto {
  @IsEnum(DispatchStatus)
  @IsNotEmpty()
  status: DispatchStatus;

  @IsOptional()
  @IsString()
  remarks?: string;
}
