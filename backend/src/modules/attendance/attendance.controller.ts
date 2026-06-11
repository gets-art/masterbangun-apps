import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockOutDto } from './dto/clock-out.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Roles(UserRole.MANDOR)
  @Post('clock-in')
  clockIn(@Request() req: any, @Body() dto: ClockInDto) {
    return this.attendanceService.clockIn(req.user.id, dto);
  }

  @Roles(UserRole.MANDOR)
  @Post('clock-out')
  clockOut(@Request() req: any, @Body() dto: ClockOutDto) {
    return this.attendanceService.clockOut(req.user.id, dto);
  }

  @Get('today/:projectId')
  getTodayStatus(@Param('projectId') projectId: string) {
    return this.attendanceService.getTodayStatus(projectId);
  }

  @Get('summary')
  getSummary(@Query('tukangId') tukangId?: string, @Query('projectId') projectId?: string) {
    return this.attendanceService.getSummary(tukangId, projectId);
  }

  @Get('overtime/pending')
  getPendingLembur(@Query('projectId') projectId?: string) {
    return this.attendanceService.getPendingLembur(projectId);
  }

  @Roles(UserRole.PENGAWAS, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Patch('overtime/:id/approve')
  approveLembur(@Param('id') id: string, @Request() req: any) {
    return this.attendanceService.approveLembur(id, req.user.id);
  }

  @Roles(UserRole.PENGAWAS, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @Patch('overtime/:id/reject')
  rejectLembur(@Param('id') id: string, @Request() req: any) {
    return this.attendanceService.rejectLembur(id, req.user.id);
  }

  @Get()
  findAll(
    @Request() req: any,
    @Query('projectId') projectId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.attendanceService.findAll(req.user.id, req.user.role, projectId, startDate, endDate);
  }
}
