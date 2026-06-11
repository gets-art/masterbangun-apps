import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Urgency } from '@prisma/client';

export class CreateMaterialDto {
  @IsString() projectId: string;
  @IsString() materialName: string;
  @IsNumber() @Min(0) quantity: number;
  @IsString() unit: string;
  @IsOptional() @IsEnum(Urgency) urgency?: Urgency;
  @IsOptional() @IsString() notes?: string;
}
