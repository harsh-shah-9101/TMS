import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateShipmentItemDto {
  @ApiProperty({ example: 'Industrial Machinery Spares', description: 'Item description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 5, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number = 1;

  @ApiPropertyOptional({ example: 250.0, default: 0, description: 'Weight in kg' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weightKg?: number = 0;

  @ApiPropertyOptional({ example: 45.0, default: 0, description: 'Volume in cubic feet' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  volumeCuFt?: number = 0;

  @ApiPropertyOptional({ example: 150000.0, description: 'Declared goods value in INR' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  declaredValue?: number;
}
