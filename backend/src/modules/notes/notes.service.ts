import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async createNote(projectId: string, userId: string, title: string, content: string) {
    return this.prisma.projectNote.create({
      data: { projectId, userId, title, content },
      include: { user: { select: { name: true, role: true } } }
    });
  }

  async getProjectNotes(projectId: string, archived: string = 'false') {
    const isArchived = archived === 'true';
    return this.prisma.projectNote.findMany({
      where: { projectId, isArchived },
      include: { user: { select: { name: true, role: true } } },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  async togglePin(id: string) {
    const note = await this.prisma.projectNote.findUnique({ where: { id } });
    if (!note) throw new NotFoundException('Note not found');
    return this.prisma.projectNote.update({
      where: { id },
      data: { isPinned: !note.isPinned },
      include: { user: { select: { name: true, role: true } } }
    });
  }

  async deleteNote(id: string) {
    const note = await this.prisma.projectNote.findUnique({ where: { id } });
    if (!note) throw new NotFoundException('Note not found');
    return this.prisma.projectNote.delete({ where: { id } });
  }

  async update(id: string, title: string, content: string) {
    return this.prisma.projectNote.update({
      where: { id },
      data: { title, content }
    });
  }

  async archive(id: string) {
    return this.prisma.projectNote.update({ where: { id }, data: { isArchived: true } });
  }

  async unarchive(id: string) {
    return this.prisma.projectNote.update({ where: { id }, data: { isArchived: false } });
  }
}
