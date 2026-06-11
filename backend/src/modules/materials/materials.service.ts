import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class MaterialsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, userRole: UserRole, projectId?: string) {
    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (userRole === UserRole.MANDOR) where.mandorId = userId;
    return this.prisma.materialRequest.findMany({
      where,
      include: { project: { select: { name: true } }, mandor: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(mandorId: string, dto: CreateMaterialDto) {
    return this.prisma.materialRequest.create({
      data: { ...dto, mandorId },
      include: { project: { select: { name: true } } },
    });
  }

  async approve(id: string, approverId: string) {
    return this.prisma.materialRequest.update({
      where: { id },
      data: { status: 'APPROVED', approvedBy: approverId, approvedAt: new Date() },
    });
  }

  async reject(id: string, approverId: string, rejectionNote: string) {
    return this.prisma.materialRequest.update({
      where: { id },
      data: { status: 'REJECTED', approvedBy: approverId, rejectionNote },
    });
  }
}
