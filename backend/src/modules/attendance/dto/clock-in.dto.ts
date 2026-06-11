import { IsString, IsOptional } from 'class-validator';

export class ClockInDto {
  @IsString() tukangId: string;
  @IsString() projectId: string;
  @IsOptional() @IsString() photoUrl?: string;
  @IsOptional() @IsString() gps?: string;
}
