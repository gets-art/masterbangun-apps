import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, FileCategory } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Roles(UserRole.ARSITEK, UserRole.ESTIMATOR, UserRole.DRAFTER, UserRole.MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN_PROYEK)
  @Post()
  create(@Request() req: any, @Body() body: { projectId: string, fileName: string, fileUrl: string, fileSize: number, fileType: string, category: FileCategory, description?: string, relatedUserId?: string, relatedTukangId?: string, materialReqId?: string }) {
    return this.documentsService.createDocument(body.projectId, req.user.id, body);
  }

  @Roles(UserRole.ARSITEK, UserRole.ESTIMATOR, UserRole.DRAFTER, UserRole.MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN_PROYEK)
  @Post(':id/versions')
  createVersion(@Request() req: any, @Param('id') id: string, @Body() body: { fileName: string, fileUrl: string, fileSize: number, fileType: string, description?: string, relatedUserId?: string, relatedTukangId?: string, materialReqId?: string }) {
    return this.documentsService.createNewVersion(id, req.user.id, body);
  }

  @Get('project/:projectId')
  getProjectDocuments(@Param('projectId') projectId: string) {
    return this.documentsService.getProjectDocuments(projectId);
  }

  @Roles(UserRole.KONSUMEN)
  @Get('consumer/:projectId')
  getConsumerDocuments(@Param('projectId') projectId: string) {
    return this.documentsService.getConsumerDocuments(projectId);
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.documentsService.getDocumentHistory(id);
  }

  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Patch(':id/share')
  toggleShare(@Param('id') id: string) {
    return this.documentsService.toggleShare(id);
  }

  @Post(':id/comments')
  addComment(@Request() req: any, @Param('id') id: string, @Body('content') content: string) {
    return this.documentsService.addComment(id, req.user.id, content);
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string) {
    return this.documentsService.getComments(id);
  }
}
