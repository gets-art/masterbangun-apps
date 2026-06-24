import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { PhotosService } from './photos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('photos')
export class PhotosController {
  constructor(private service: PhotosService) {}

  @Roles(UserRole.KONSUMEN)
  @Get('consumer/:projectId')
  getConsumerPhotos(@Param('projectId') projectId: string) {
    return this.service.getConsumerPhotos(projectId);
  }

  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Patch(':id/share')
  share(@Param('id') id: string, @Request() req: any) {
    return this.service.shareToConsumer(id, req.user.id);
  }

  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Patch(':id/unshare')
  unshare(@Param('id') id: string) {
    return this.service.unshare(id);
  }

  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Delete(':id')
  softDelete(@Param('id') id: string, @Request() req: any) {
    return this.service.softDelete(id, req.user.id);
  }

  @Roles(UserRole.PENGAWAS)
  @Post('session/:sessionId')
  uploadToSession(
    @Param('sessionId') sessionId: string,
    @Body('photoUrls') photoUrls: string[],
    @Body('caption') caption?: string
  ) {
    return this.service.uploadToSession(sessionId, photoUrls, caption);
  }
}
