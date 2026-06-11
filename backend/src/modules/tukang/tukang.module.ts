import { Module } from '@nestjs/common';
import { TukangController } from './tukang.controller';
import { TukangService } from './tukang.service';

@Module({
  controllers: [TukangController],
  providers: [TukangService],
  exports: [TukangService],
})
export class TukangModule {}
