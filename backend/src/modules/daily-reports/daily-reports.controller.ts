import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { DailyReportsService } from './daily-reports.service';
import { CreateDailyReportDto } from './dto/create-daily-report.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('daily-reports')
export class DailyReportsController {
  constructor(private service: DailyReportsService) {}

  @Get()
  findAll(@Request() req: any, @Query('projectId') projectId?: string) {
    return this.service.findAll(req.user.id, req.user.role, projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Roles(UserRole.PENGAWAS)
  @Post()
  create(@Request() req: any, @Body() dto: CreateDailyReportDto) {
    return this.service.create(req.user.id, dto);
  }

  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Patch(':id/approve')
  approve(@Param('id') id: string) { return this.service.approve(id); }

  @Roles(UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Patch(':id/revision')
  revision(@Param('id') id: string, @Body('notes') notes: string) {
    return this.service.requestRevision(id, notes);
  }

  @Roles(UserRole.PENGAWAS)
  @Post(':id/photo-sessions')
  createPhotoSession(
    @Param('id') id: string,
    @Body('title') title?: string,
    @Body('description') description?: string
  ) {
    return this.service.createPhotoSession(id, title, description);
  }

  @Get(':id/photo-sessions')
  getPhotoSessions(@Param('id') id: string) {
    return this.service.getPhotoSessions(id);
  }
}
