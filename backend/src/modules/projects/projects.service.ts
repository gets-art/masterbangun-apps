import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, userRole: UserRole) {
    // Super admin and manager see all, others see assigned only
    if (userRole === UserRole.SUPER_ADMIN || userRole === UserRole.MANAGER || userRole === UserRole.ADMIN_PROYEK) {
      return this.prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
    }
    return this.prisma.project.findMany({
      where: { userAssignments: { some: { userId } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        userAssignments: { include: { user: { select: { id: true, name: true, role: true } } } },
        tukangAssignments: { include: { tukang: true }, where: { isActive: true } },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.MANAGER && userRole !== UserRole.ADMIN_PROYEK) {
      const assigned = project.userAssignments.some(a => a.userId === userId);
      if (!assigned) throw new ForbiddenException();
    }
    return project;
  }

  async create(dto: CreateProjectDto) {
    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.estimatedEndDate) data.estimatedEndDate = new Date(dto.estimatedEndDate);
    return this.prisma.project.create({ data });
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.prisma.project.findUniqueOrThrow({ where: { id } });
    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.estimatedEndDate) data.estimatedEndDate = new Date(dto.estimatedEndDate);
    return this.prisma.project.update({ where: { id }, data });
  }

  async assignUser(projectId: string, userId: string) {
    return this.prisma.projectUser.upsert({
      where: { projectId_userId: { projectId, userId } },
      create: { projectId, userId },
      update: {},
    });
  }

  async assignTukang(projectId: string, tukangId: string) {
    return this.prisma.projectTukang.upsert({
      where: { projectId_tukangId: { projectId, tukangId } },
      create: { projectId, tukangId, isActive: true },
      update: { isActive: true },
    });
  }

  async getTukangInProject(projectId: string) {
    return this.prisma.projectTukang.findMany({
      where: { projectId, isActive: true },
      include: { tukang: true },
    });
  }
}
