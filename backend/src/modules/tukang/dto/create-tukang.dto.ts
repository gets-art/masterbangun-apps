import { IsOptional, IsString, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { TukangType } from '@prisma/client';

export class CreateTukangDto {
  @IsString()
  name: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  skill?: string;

  @IsOptional() @IsEnum(TukangType)
  type?: TukangType;

  @IsOptional() @IsNumber()
  dailyRate?: number;

  @IsOptional() @IsNumber()
  contractValue?: number;

  @IsOptional() @IsString()
  contractDesc?: string;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

