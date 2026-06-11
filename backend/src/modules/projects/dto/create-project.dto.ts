import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ProjectStatus } from '@prisma/client';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  gpsCoordinates?: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  estimatedEndDate?: string;

  @IsOptional()
  @IsString()
  normalStartHour?: string;

  @IsOptional()
  @IsString()
  normalEndHour?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}
