import { IsString, IsOptional } from 'class-validator';

export class ClockOutDto {
  @IsString() tukangId: string;
  @IsString() projectId: string;
  @IsOptional() @IsString() photoUrl?: string;
  @IsOptional() @IsString() gps?: string;
}
