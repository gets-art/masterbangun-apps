import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTukangDto } from './dto/create-tukang.dto';
import { UpdateTukangDto } from './dto/update-tukang.dto';

@Injectable()
export class TukangService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.tukang.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const t = await this.prisma.tukang.findUnique({ where: { id } });
    if (!t) throw new NotFoundException('Tukang not found');
    return t;
  }

  create(dto: CreateTukangDto) {
    return this.prisma.tukang.create({ data: dto });
  }

  async update(id: string, dto: UpdateTukangDto) {
    await this.findOne(id);
    return this.prisma.tukang.update({ where: { id }, data: dto });
  }
}
