import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { NotesService } from './notes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Roles(UserRole.ARSITEK, UserRole.ESTIMATOR, UserRole.DRAFTER, UserRole.MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN_PROYEK)
  @Post()
  create(@Request() req: any, @Body() body: { projectId: string, title: string, content: string }) {
    return this.notesService.createNote(body.projectId, req.user.id, body.title, body.content);
  }

  @Roles(UserRole.ARSITEK, UserRole.ESTIMATOR, UserRole.DRAFTER, UserRole.MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN_PROYEK)
  @Get('project/:projectId')
  getProjectNotes(@Param('projectId') projectId: string) {
    return this.notesService.getProjectNotes(projectId);
  }

  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN_PROYEK)
  @Patch(':id/pin')
  togglePin(@Param('id') id: string) {
    return this.notesService.togglePin(id);
  }

  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN_PROYEK)
  @Delete(':id')
  deleteNote(@Param('id') id: string) {
    return this.notesService.deleteNote(id);
  }
}
