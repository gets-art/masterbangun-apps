import { PrismaClient, UserRole, Language } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as bcrypt from 'bcrypt';
import path from 'path';

const dbUrl = `file:${path.join(path.dirname(__dirname), 'dev.db')}`;
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('🌱 Seeding database...');

  // Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@masterbangun.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@masterbangun.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: UserRole.SUPER_ADMIN,
      language: Language.ID,
    },
  });

  // Manager Operasional
  const manager = await prisma.user.upsert({
    where: { email: 'manager@masterbangun.com' },
    update: {},
    create: {
      name: 'Budi Santoso',
      email: 'manager@masterbangun.com',
      passwordHash: await bcrypt.hash('manager123', 10),
      role: UserRole.MANAGER,
      phone: '08111111111',
      language: Language.ID,
    },
  });

  // Admin Proyek
  const admin = await prisma.user.upsert({
    where: { email: 'admin@masterbangun.com' },
    update: {},
    create: {
      name: 'Siti Rahayu',
      email: 'admin@masterbangun.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: UserRole.ADMIN_PROYEK,
      phone: '08222222222',
      language: Language.ID,
    },
  });

  // Pengawas Lapangan
  const pengawas = await prisma.user.upsert({
    where: { email: 'pengawas@masterbangun.com' },
    update: {},
    create: {
      name: 'Andi Wijaya',
      email: 'pengawas@masterbangun.com',
      passwordHash: await bcrypt.hash('pengawas123', 10),
      role: UserRole.PENGAWAS,
      phone: '08333333333',
      language: Language.ID,
    },
  });

  // Mandor
  const mandor = await prisma.user.upsert({
    where: { email: 'mandor@masterbangun.com' },
    update: {},
    create: {
      name: 'Joko Prabowo',
      email: 'mandor@masterbangun.com',
      passwordHash: await bcrypt.hash('mandor123', 10),
      role: UserRole.MANDOR,
      phone: '08444444444',
      language: Language.ID,
    },
  });

  // Konsumen
  const konsumen = await prisma.user.upsert({
    where: { email: 'konsumen@example.com' },
    update: {},
    create: {
      name: 'Pak Hendra',
      email: 'konsumen@example.com',
      passwordHash: await bcrypt.hash('konsumen123', 10),
      role: UserRole.KONSUMEN,
      phone: '08555555555',
      language: Language.ID,
    },
  });

  console.log('✅ Users created');

  // Sample Tukang
  const tukang1 = await prisma.tukang.upsert({
    where: { id: 'tukang-1' },
    update: {},
    create: {
      id: 'tukang-1',
      name: 'Ahmad Fauzi',
      phone: '08611111111',
      skill: 'Bata & Plester',
    },
  });

  const tukang2 = await prisma.tukang.upsert({
    where: { id: 'tukang-2' },
    update: {},
    create: {
      id: 'tukang-2',
      name: 'Dodi Prasetyo',
      phone: '08622222222',
      skill: 'Baja & Rangka',
    },
  });

  const tukang3 = await prisma.tukang.upsert({
    where: { id: 'tukang-3' },
    update: {},
    create: {
      id: 'tukang-3',
      name: 'Eko Susanto',
      phone: '08633333333',
      skill: 'Finishing & Cat',
    },
  });

  console.log('✅ Tukang created');

  // Sample Project
  const project = await prisma.project.upsert({
    where: { id: 'project-1' },
    update: {},
    create: {
      id: 'project-1',
      name: 'Rumah Pak Hendra - Jl. Mawar No. 5',
      address: 'Jl. Mawar No. 5, Jakarta Selatan',
      startDate: new Date('2026-01-15'),
      estimatedEndDate: new Date('2026-08-15'),
      progressPercentage: 45,
      normalStartHour: '08:00',
      normalEndHour: '16:00',
      workDays: '1,2,3,4,5,6',
    },
  });

  // Assign users to project
  await prisma.projectUser.upsert({
    where: { projectId_userId: { projectId: project.id, userId: pengawas.id } },
    update: {},
    create: { projectId: project.id, userId: pengawas.id },
  });

  await prisma.projectUser.upsert({
    where: { projectId_userId: { projectId: project.id, userId: mandor.id } },
    update: {},
    create: { projectId: project.id, userId: mandor.id },
  });

  await prisma.projectUser.upsert({
    where: { projectId_userId: { projectId: project.id, userId: konsumen.id } },
    update: {},
    create: { projectId: project.id, userId: konsumen.id },
  });

  // Assign tukang to project
  for (const tukang of [tukang1, tukang2, tukang3]) {
    await prisma.projectTukang.upsert({
      where: { projectId_tukangId: { projectId: project.id, tukangId: tukang.id } },
      update: {},
      create: { projectId: project.id, tukangId: tukang.id, isActive: true },
    });
  }

  console.log('✅ Project and assignments created');

  console.log('\n🎉 Seeding complete!\n');
  console.log('=== LOGIN CREDENTIALS ===');
  console.log('Super Admin : superadmin@masterbangun.com / admin123');
  console.log('Manager     : manager@masterbangun.com    / manager123');
  console.log('Admin       : admin@masterbangun.com      / admin123');
  console.log('Pengawas    : pengawas@masterbangun.com   / pengawas123');
  console.log('Mandor      : mandor@masterbangun.com     / mandor123');
  console.log('Konsumen    : konsumen@example.com        / konsumen123');
  console.log('=========================\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
