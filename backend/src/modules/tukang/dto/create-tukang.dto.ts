import { IsOptional, IsString } from 'class-validator';

export class CreateTukangDto {
  @IsString()
  name: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  skill?: string;
}
