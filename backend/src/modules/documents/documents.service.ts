import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileCategory } from '@prisma/client';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async createDocument(projectId: string, uploadedBy: string, data: { fileName: string, fileUrl: string, fileSize: number, fileType: string, category: FileCategory, description?: string, relatedUserId?: string, relatedTukangId?: string, materialReqId?: string }) {
    return this.prisma.projectDocument.create({
      data: {
        projectId,
        uploadedBy,
        ...data,
      },
      include: { uploader: { select: { name: true, role: true } }, relatedUser: { select: { name: true, role: true } }, relatedTukang: { select: { name: true, type: true } }, materialRequest: true }
    });
  }

  async createNewVersion(parentId: string, uploadedBy: string, data: { fileName: string, fileUrl: string, fileSize: number, fileType: string, description?: string, relatedUserId?: string, relatedTukangId?: string, materialReqId?: string }) {
    const parent = await this.prisma.projectDocument.findUnique({ where: { id: parentId } });
    if (!parent) throw new NotFoundException('Document not found');

    // Mark previous latest as not latest
    await this.prisma.projectDocument.updateMany({
      where: { OR: [{ id: parentId }, { parentId }] },
      data: { isLatest: false }
    });

    // Get max version
    const maxVersionDoc = await this.prisma.projectDocument.findFirst({
      where: { OR: [{ id: parentId }, { parentId }] },
      orderBy: { version: 'desc' }
    });

    return this.prisma.projectDocument.create({
      data: {
        projectId: parent.projectId,
        uploadedBy,
        category: parent.category,
        parentId: parent.parentId || parent.id, // always link to root
        version: (maxVersionDoc?.version || 1) + 1,
        isLatest: true,
        ...data,
      },
      include: { uploader: { select: { name: true, role: true } }, relatedUser: { select: { name: true, role: true } }, relatedTukang: { select: { name: true, type: true } }, materialRequest: true }
    });
  }

  async getProjectDocuments(projectId: string, archived: string = 'false') {
    const isArchived = archived === 'true';
    return this.prisma.projectDocument.findMany({
      where: { projectId, isLatest: true, isArchived },
      include: { uploader: { select: { name: true, role: true } }, relatedUser: { select: { name: true, role: true } }, relatedTukang: { select: { name: true, type: true } }, materialRequest: true, _count: { select: { versions: true, comments: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getConsumerDocuments(projectId: string) {
    return this.prisma.projectDocument.findMany({
      where: { projectId, isLatest: true, sharedToConsumer: true },
      include: { uploader: { select: { name: true, role: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getDocumentHistory(documentId: string) {
    const doc = await this.prisma.projectDocument.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found');
    const rootId = doc.parentId || doc.id;
    return this.prisma.projectDocument.findMany({
      where: { OR: [{ id: rootId }, { parentId: rootId }] },
      include: { uploader: { select: { name: true, role: true } } },
      orderBy: { version: 'desc' }
    });
  }

  async toggleShare(documentId: string) {
    const doc = await this.prisma.projectDocument.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found');
    return this.prisma.projectDocument.update({
      where: { id: documentId },
      data: { sharedToConsumer: !doc.sharedToConsumer }
    });
  }

  async addComment(documentId: string, userId: string, content: string) {
    return this.prisma.documentComment.create({
      data: { documentId, userId, content },
      include: { user: { select: { name: true, role: true } } }
    });
  }

  async getComments(documentId: string) {
    return this.prisma.documentComment.findMany({
      where: { documentId },
      include: { user: { select: { name: true, role: true } } },
      orderBy: { createdAt: 'asc' }
    });
  }

  async update(id: string, data: any) {
    return this.prisma.projectDocument.update({
      where: { id },
      data: {
        fileName: data.fileName,
        category: data.category,
        description: data.description,
        relatedUserId: data.relatedUserId || null,
        relatedTukangId: data.relatedTukangId || null,
        materialReqId: data.materialReqId || null,
      }
    });
  }

  async archive(id: string) {
    return this.prisma.projectDocument.update({ where: { id }, data: { isArchived: true } });
  }

  async unarchive(id: string) {
    return this.prisma.projectDocument.update({ where: { id }, data: { isArchived: false } });
  }
}
