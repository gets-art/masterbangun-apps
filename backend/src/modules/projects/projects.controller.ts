import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  findAll(@Request() req: any, @Query('city') city?: string, @Query('archived') archived?: string) {
    return this.projectsService.findAll(req.user.id, req.user.role, city, archived);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.projectsService.findOne(id, req.user.id, req.user.role);
  }

  @Roles(UserRole.ADMIN_PROYEK, UserRole.SUPER_ADMIN)
  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Roles(UserRole.ADMIN_PROYEK, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Roles(UserRole.ADMIN_PROYEK, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Patch(':id/archive')
  archive(@Param('id') id: string) {
    return this.projectsService.archive(id);
  }

  @Roles(UserRole.ADMIN_PROYEK, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Patch(':id/unarchive')
  unarchive(@Param('id') id: string) {
    return this.projectsService.unarchive(id);
  }

  @Roles(UserRole.ADMIN_PROYEK, UserRole.SUPER_ADMIN)
  @Post(':id/assign-user')
  assignUser(@Param('id') projectId: string, @Body('userId') userId: string) {
    return this.projectsService.assignUser(projectId, userId);
  }

  @Roles(UserRole.ADMIN_PROYEK, UserRole.SUPER_ADMIN)
  @Post(':id/assign-tukang')
  assignTukang(
    @Param('id') projectId: string, 
    @Body('tukangId') tukangId: string,
    @Body('contractValue') contractValue?: number,
    @Body('contractDesc') contractDesc?: string
  ) {
    return this.projectsService.assignTukang(projectId, tukangId, { contractValue, contractDesc });
  }

  @Roles(UserRole.PENGAWAS, UserRole.MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN_PROYEK)
  @Patch(':id/tukang/:tukangId/progress')
  updateTukangProgress(
    @Param('id') projectId: string,
    @Param('tukangId') tukangId: string,
    @Body('progressPercent') progressPercent: number
  ) {
    return this.projectsService.updateTukangProgress(projectId, tukangId, progressPercent);
  }

  @Get(':id/tukang')
  getTukang(@Param('id') projectId: string) {
    return this.projectsService.getTukangInProject(projectId);
  }
}
