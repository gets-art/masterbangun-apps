import { PartialType } from '@nestjs/mapped-types';
import { CreateTukangDto } from './create-tukang.dto';
export class UpdateTukangDto extends PartialType(CreateTukangDto) {}
