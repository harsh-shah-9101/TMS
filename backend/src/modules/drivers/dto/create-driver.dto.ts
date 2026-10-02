import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { DriverStatus } from '../../../common/enums';

export class CreateDriverDto {
  @ApiProperty({ example: 'Rahul', description: 'Driver first name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Sharma', description: 'Driver last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '+919876543210', description: 'Driver phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'DL1420110012345', description: 'Driver license number (unique per organization)' })
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @ApiPropertyOptional({ example: 'HMV', description: 'License category (e.g. HMV, LMV, TRANS)' })
  @IsOptional()
  @IsString()
  licenseCategory?: string;

  @ApiPropertyOptional({ example: '2028-12-31T00:00:00.000Z', description: 'License expiry date' })
  @IsOptional()
  @IsDateString()
  licenseExpiry?: string;

  @ApiPropertyOptional({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Optional associated user account ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    enum: DriverStatus,
    default: DriverStatus.AVAILABLE,
    description: 'Driver operational status',
  })
  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;
}
