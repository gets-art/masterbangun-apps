import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTukangDto } from './dto/create-tukang.dto';
import { UpdateTukangDto } from './dto/update-tukang.dto';

@Injectable()
export class TukangService {
  constructor(private prisma: PrismaService) {}

  findAll(type?: string, archived: string = 'false') {
    const isArchived = archived === 'true';
    const where: any = { isArchived };
    if (type) where.type = type as any;
    return this.prisma.tukang.findMany({ where, orderBy: { name: 'asc' } });
  }

  findByProject(projectId: string) {
    return this.prisma.projectTukang.findMany({
      where: { projectId },
      include: { tukang: true },
    }).then(pts => pts.map(pt => ({
      ...pt.tukang,
      contractValueProject: pt.contractValue,
      contractDescProject: pt.contractDesc,
      progressPercent: pt.progressPercent,
      isActiveInProject: pt.isActive,
    })));
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
    return this.prisma.tukang.update({ where: { id }, data: dto as any });
  }

  async archive(id: string) {
    return this.prisma.tukang.update({ where: { id }, data: { isArchived: true } });
  }

  async unarchive(id: string) {
    return this.prisma.tukang.update({ where: { id }, data: { isArchived: false } });
  }
}
