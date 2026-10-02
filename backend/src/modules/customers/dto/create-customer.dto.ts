import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { CustomerStatus, CustomerType } from '../../../common/enums';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Reliance Industries Ltd', description: 'Customer / Party full legal name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'RIL001', description: 'Unique customer code within organization' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({
    enum: CustomerType,
    default: CustomerType.BOTH,
    description: 'Customer classification (SHIPPER, CONSIGNEE, BOTH)',
  })
  @IsOptional()
  @IsEnum(CustomerType)
  type?: CustomerType;

  @ApiPropertyOptional({ example: '27AAAAA0000A1Z5', description: 'GSTIN Registration Number' })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
    message: 'GSTIN format is invalid',
  })
  gstin?: string;

  @ApiPropertyOptional({ example: 'AAAAA0000A', description: 'PAN Card Number' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
    message: 'PAN format is invalid',
  })
  pan?: string;

  @ApiPropertyOptional({ example: 'logistics@ril.com', description: 'Contact email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+912222888800', description: 'Contact phone' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Maker Chambers IV, Nariman Point', description: 'Address line 1' })
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @ApiPropertyOptional({ example: 'Near Air India Building', description: 'Address line 2' })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiPropertyOptional({ example: 'Mumbai', description: 'City' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Maharashtra', description: 'State' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '400021', description: 'Pincode' })
  @IsOptional()
  @IsString()
  pincode?: string;

  @ApiPropertyOptional({
    enum: CustomerStatus,
    default: CustomerStatus.ACTIVE,
    description: 'Account operational status',
  })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;
}
