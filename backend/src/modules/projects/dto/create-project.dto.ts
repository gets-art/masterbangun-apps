import { IsString, IsOptional, IsDateString } from 'class-validator';

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
}
