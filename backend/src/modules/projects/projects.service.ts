import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, userRole: UserRole, city?: string) {
    const whereClause: any = {};
    if (city) whereClause.city = { contains: city };

    // Super admin and manager see all, others see assigned only
    if (userRole === UserRole.SUPER_ADMIN || userRole === UserRole.MANAGER || userRole === UserRole.ADMIN_PROYEK) {
      return this.prisma.project.findMany({ where: whereClause, orderBy: { createdAt: 'desc' } });
    }
    
    whereClause.userAssignments = { some: { userId } };
    return this.prisma.project.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, userRole: UserRole) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        userAssignments: { include: { user: { select: { id: true, name: true, role: true } } } },
        tukangAssignments: { include: { tukang: true }, where: { isActive: true } },
        materialRequests: { orderBy: { createdAt: 'desc' } },
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

  async assignTukang(projectId: string, tukangId: string, overrides?: { contractValue?: number, contractDesc?: string }) {
    return this.prisma.projectTukang.upsert({
      where: { projectId_tukangId: { projectId, tukangId } },
      create: { projectId, tukangId, isActive: true, ...overrides },
      update: { isActive: true, ...overrides },
    });
  }

  async updateTukangProgress(projectId: string, tukangId: string, progressPercent: number) {
    return this.prisma.projectTukang.update({
      where: { projectId_tukangId: { projectId, tukangId } },
      data: { progressPercent }
    });
  }

  async getTukangInProject(projectId: string) {
    return this.prisma.projectTukang.findMany({
      where: { projectId, isActive: true },
      include: { tukang: true },
    }).then(pts => pts.map(pt => ({
      ...pt.tukang,
      contractValueProject: pt.contractValue,
      contractDescProject: pt.contractDesc,
      progressPercent: pt.progressPercent,
      isActiveInProject: pt.isActive,
    })));
  }
}
