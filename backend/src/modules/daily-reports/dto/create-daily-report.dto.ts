import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Weather } from '@prisma/client';

export class CreateDailyReportDto {
  @IsString() projectId: string;
  @IsString() reportDate: string;
  @IsEnum(Weather) weather: Weather;
  @IsString() description: string;
  @IsInt() @Min(0) @Max(100) progressPercentage: number;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() materialAvailability?: string;
  @IsOptional() photoUrls?: string[];
}
