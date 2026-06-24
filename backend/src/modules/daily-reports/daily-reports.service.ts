import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDailyReportDto } from './dto/create-daily-report.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class DailyReportsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, userRole: UserRole, projectId?: string) {
    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (userRole === UserRole.PENGAWAS) where.pengawasId = userId;
    return this.prisma.dailyReport.findMany({
      where,
      include: { project: { select: { name: true } }, pengawas: { select: { name: true } }, photos: { where: { isDeleted: false } } },
      orderBy: { reportDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const r = await this.prisma.dailyReport.findUnique({
      where: { id },
      include: { 
        project: true, 
        pengawas: { select: { name: true } }, 
        photos: { where: { isDeleted: false } },
        photoSessions: { include: { photos: { where: { isDeleted: false } } } }
      },
    });
    if (!r) throw new NotFoundException('Report not found');
    return r;
  }

  async create(pengawasId: string, dto: CreateDailyReportDto) {
    const { photoUrls, ...restDto } = dto;
    return this.prisma.dailyReport.create({
      data: {
        ...restDto,
        pengawasId,
        status: 'SUBMITTED',
        photos: photoUrls && photoUrls.length > 0 ? {
          create: photoUrls.map(url => ({ photoUrl: url }))
        } : undefined,
      },
      include: { photos: true },
    });
  }

  async approve(id: string) {
    const report = await this.prisma.dailyReport.update({ 
      where: { id }, 
      data: { status: 'APPROVED' } 
    });
    
    // Update the project's progress percentage if this report has a higher progress
    const project = await this.prisma.project.findUnique({ where: { id: report.projectId } });
    if (project && report.progressPercentage > project.progressPercentage) {
      await this.prisma.project.update({
        where: { id: report.projectId },
        data: { progressPercentage: report.progressPercentage }
      });
    }
    
    return report;
  }

  async requestRevision(id: string, notes: string) {
    return this.prisma.dailyReport.update({ where: { id }, data: { status: 'REVISION', notes } });
  }

  async createPhotoSession(dailyReportId: string, title?: string, description?: string) {
    return this.prisma.photoSession.create({
      data: {
        dailyReportId,
        title,
        description,
      }
    });
  }

  async getPhotoSessions(dailyReportId: string) {
    return this.prisma.photoSession.findMany({
      where: { dailyReportId },
      include: { photos: { where: { isDeleted: false } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
