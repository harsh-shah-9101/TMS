import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { RoleName } from '../../../common/enums';

export class RegisterDto {
  @ApiProperty({ example: 'Demo Transport Pvt Ltd', description: 'Organization name' })
  @IsString()
  @IsNotEmpty()
  organizationName: string;

  @ApiProperty({ example: 'DEMO-TMS', description: 'Unique organization code' })
  @IsString()
  @IsNotEmpty()
  organizationCode: string;

  @ApiProperty({ example: 'admin@demo-tms.com', description: 'Admin user email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!', description: 'Password (min 8 characters)' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({ example: 'John', description: 'First name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Contact phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    enum: RoleName,
    default: RoleName.ADMIN,
    description: 'Initial user role within organization',
  })
  @IsOptional()
  @IsEnum(RoleName)
  role?: RoleName;
}
