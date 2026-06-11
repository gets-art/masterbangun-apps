import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockOutDto } from './dto/clock-out.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  private calculateOvertimeHours(clockOut: Date, normalEndHour: string): number {
    const [endH, endM] = normalEndHour.split(':').map(Number);
    const normalEnd = new Date(clockOut);
    normalEnd.setHours(endH, endM, 0, 0);
    if (clockOut <= normalEnd) return 0;
    const diffMs = clockOut.getTime() - normalEnd.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.ceil(diffHours); // Round UP per requirement
  }

  async clockIn(mandorId: string, dto: ClockInDto) {
    const today = new Date().toISOString().split('T')[0];
    // Check if already clocked in for this tukang+project today
    const existing = await this.prisma.attendance.findUnique({
      where: { tukangId_projectId_attendanceDate: { tukangId: dto.tukangId, projectId: dto.projectId, attendanceDate: today } },
    });
    if (existing) throw new BadRequestException('Tukang sudah absen masuk hari ini untuk proyek ini');

    return this.prisma.attendance.create({
      data: {
        tukangId: dto.tukangId,
        projectId: dto.projectId,
        mandorId,
        attendanceDate: today,
        clockIn: new Date(),
        photoInUrl: dto.photoUrl,
        gpsIn: dto.gps,
      },
      include: { tukang: true, project: true },
    });
  }

  async clockOut(mandorId: string, dto: ClockOutDto) {
    const today = new Date().toISOString().split('T')[0];
    const attendance = await this.prisma.attendance.findUnique({
      where: { tukangId_projectId_attendanceDate: { tukangId: dto.tukangId, projectId: dto.projectId, attendanceDate: today } },
      include: { project: true },
    });
    if (!attendance) throw new BadRequestException('Tukang belum absen masuk');
    if (attendance.clockOut) throw new BadRequestException('Tukang sudah absen keluar');

    const clockOut = new Date();
    const overtimeHours = this.calculateOvertimeHours(clockOut, attendance.project.normalEndHour);

    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        clockOut,
        photoOutUrl: dto.photoUrl,
        gpsOut: dto.gps,
        overtimeHours,
        overtimeStatus: overtimeHours > 0 ? 'PENDING' : 'APPROVED',
      },
      include: { tukang: true, project: true },
    });
  }

  async getTodayStatus(projectId: string) {
    const today = new Date().toISOString().split('T')[0];
    return this.prisma.attendance.findMany({
      where: { projectId, attendanceDate: today },
      include: { tukang: true },
    });
  }

  async findAll(userId: string, userRole: UserRole, projectId?: string, startDate?: string, endDate?: string) {
    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (startDate) where.attendanceDate = { gte: startDate };
    if (endDate) where.attendanceDate = { ...where.attendanceDate, lte: endDate };
    if (userRole === UserRole.MANDOR) where.mandorId = userId;
    return this.prisma.attendance.findMany({
      where,
      include: { tukang: true, project: { select: { name: true } }, mandor: { select: { name: true } } },
      orderBy: { attendanceDate: 'desc' },
    });
  }

  async getSummary(tukangId?: string, projectId?: string) {
    const where: any = {};
    if (tukangId) where.tukangId = tukangId;
    if (projectId) where.projectId = projectId;
    const records = await this.prisma.attendance.findMany({ where });
    // Count unique days (multi-project same day = 1 day)
    const uniqueDates = new Set(records.map(r => r.attendanceDate));
    const totalDays = uniqueDates.size;
    const totalOvertime = records.reduce((sum, r) => sum + (r.overtimeHours || 0), 0);
    return { totalDays, totalOvertimeHours: totalOvertime, records };
  }

  async approveLembur(attendanceId: string, pengawasId: string) {
    return this.prisma.attendance.update({
      where: { id: attendanceId },
      data: { overtimeStatus: 'APPROVED', overtimeApprovedBy: pengawasId },
    });
  }

  async rejectLembur(attendanceId: string, pengawasId: string) {
    return this.prisma.attendance.update({
      where: { id: attendanceId },
      data: { overtimeStatus: 'REJECTED', overtimeApprovedBy: pengawasId },
    });
  }

  async getPendingLembur(projectId?: string) {
    return this.prisma.attendance.findMany({
      where: { overtimeHours: { gt: 0 }, overtimeStatus: 'PENDING', ...(projectId ? { projectId } : {}) },
      include: { tukang: true, project: { select: { name: true } } },
    });
  }
}
