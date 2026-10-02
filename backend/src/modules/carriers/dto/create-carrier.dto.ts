import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { CarrierStatus } from '../../../common/enums';

export class CreateCarrierDto {
  @ApiProperty({ example: 'VRL Logistics Ltd', description: 'Transporter / Carrier legal name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'VRL001', description: 'Unique carrier code within organization' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: '29AAAAA0000A1Z5', description: 'GSTIN Registration Number' })
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

  @ApiPropertyOptional({ example: 'ops@vrllogistics.com', description: 'Contact email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+918362237600', description: 'Contact phone' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'RS No 351/1, Varur, Hubballi', description: 'Address line 1' })
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @ApiPropertyOptional({ example: 'Hubballi', description: 'City' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Karnataka', description: 'State' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: '581207', description: 'Pincode' })
  @IsOptional()
  @IsString()
  pincode?: string;

  @ApiPropertyOptional({ example: 4.8, default: 5.0, description: 'Carrier performance rating (1.0 to 5.0)' })
  @IsOptional()
  @IsNumber()
  @Min(1.0)
  @Max(5.0)
  rating?: number;

  @ApiPropertyOptional({
    enum: CarrierStatus,
    default: CarrierStatus.ACTIVE,
    description: 'Carrier status (ACTIVE, INACTIVE, BLACKLISTED)',
  })
  @IsOptional()
  @IsEnum(CarrierStatus)
  status?: CarrierStatus;
}
