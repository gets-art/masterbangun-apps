import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('materials')
export class MaterialsController {
  constructor(private service: MaterialsService) {}

  @Get()
  findAll(@Request() req: any, @Query('projectId') projectId?: string) {
    return this.service.findAll(req.user.id, req.user.role, projectId);
  }

  @Roles(UserRole.MANDOR)
  @Post()
  create(@Request() req: any, @Body() dto: CreateMaterialDto) {
    return this.service.create(req.user.id, dto);
  }

  @Roles(UserRole.PENGAWAS, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Patch(':id/approve')
  approve(@Param('id') id: string, @Request() req: any) {
    return this.service.approve(id, req.user.id);
  }

  @Roles(UserRole.PENGAWAS, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Patch(':id/reject')
  reject(@Param('id') id: string, @Request() req: any, @Body('rejectionNote') note: string) {
    return this.service.reject(id, req.user.id, note);
  }
}
