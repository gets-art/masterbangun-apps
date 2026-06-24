import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TukangModule } from './modules/tukang/tukang.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { DailyReportsModule } from './modules/daily-reports/daily-reports.module';
import { MaterialsModule } from './modules/materials/materials.module';
import { PhotosModule } from './modules/photos/photos.module';
import { UploadModule } from './modules/upload/upload.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { NotesModule } from './modules/notes/notes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    TukangModule,
    AttendanceModule,
    DailyReportsModule,
    MaterialsModule,
    PhotosModule,
    UploadModule,
    NotificationsModule,
    DocumentsModule,
    NotesModule,
  ],
})
export class AppModule {}
