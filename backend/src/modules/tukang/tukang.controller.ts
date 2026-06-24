import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TukangService } from './tukang.service';
import { CreateTukangDto } from './dto/create-tukang.dto';
import { UpdateTukangDto } from './dto/update-tukang.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tukang')
export class TukangController {
  constructor(private tukangService: TukangService) {}

  @Roles(UserRole.ADMIN_PROYEK, UserRole.MANAGER, UserRole.SUPER_ADMIN, UserRole.PENGAWAS, UserRole.MANDOR)
  @Get()
  findAll(@Query('type') type?: string, @Query('archived') archived?: string) { return this.tukangService.findAll(type, archived); }

  @Roles(UserRole.ADMIN_PROYEK, UserRole.MANAGER, UserRole.SUPER_ADMIN, UserRole.PENGAWAS, UserRole.MANDOR)
  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) { return this.tukangService.findByProject(projectId); }

  @Roles(UserRole.ADMIN_PROYEK, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) { return this.tukangService.findOne(id); }

  @Roles(UserRole.ADMIN_PROYEK, UserRole.SUPER_ADMIN)
  @Post()
  create(@Body() dto: CreateTukangDto) { return this.tukangService.create(dto); }

  @Roles(UserRole.ADMIN_PROYEK, UserRole.SUPER_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTukangDto) { return this.tukangService.update(id, dto); }

  @Roles(UserRole.ADMIN_PROYEK, UserRole.SUPER_ADMIN)
  @Patch(':id/archive')
  archive(@Param('id') id: string) { return this.tukangService.archive(id); }

  @Roles(UserRole.ADMIN_PROYEK, UserRole.SUPER_ADMIN)
  @Patch(':id/unarchive')
  unarchive(@Param('id') id: string) { return this.tukangService.unarchive(id); }
}
