import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PhotosService {
  constructor(private prisma: PrismaService) {}

  async getConsumerPhotos(projectId: string) {
    return this.prisma.reportPhoto.findMany({
      where: { sharedToConsumer: true, approvedByManager: true, isDeleted: false, dailyReport: { projectId } },
      include: { dailyReport: { select: { reportDate: true, project: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async shareToConsumer(photoId: string, managerId: string) {
    return this.prisma.reportPhoto.update({
      where: { id: photoId },
      data: { sharedToConsumer: true, approvedByManager: true, approvedBy: managerId, approvedAt: new Date() },
    });
  }

  async unshare(photoId: string) {
    return this.prisma.reportPhoto.update({
      where: { id: photoId },
      data: { sharedToConsumer: false },
    });
  }

  async softDelete(photoId: string, managerId: string) {
    return this.prisma.reportPhoto.update({
      where: { id: photoId },
      data: { isDeleted: true, deletedBy: managerId, deletedAt: new Date() },
    });
  }

  async findOne(photoId: string) {
    const photo = await this.prisma.reportPhoto.findUnique({ where: { id: photoId } });
    if (!photo) throw new NotFoundException('Photo not found');
    return photo;
  }
}
