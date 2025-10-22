import { PrismaClient, UserRole, UserStatus, Gender, BranchStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Hash the admin password
  const hashedPassword = await bcrypt.hash('6366aaee36', 10);

  // Create Branches
  console.log('🏢 Creating branches...');
  const branches = await Promise.all([
    prisma.branch.upsert({
      where: { id: 'branch-1' },
      update: {},
      create: {
        id: 'branch-1',
        name: 'Sucursal Principal',
        code: 'MAIN',
        address: 'Av. Principal 123',
        phoneNumber: '+1234567890',
        email: 'main@stl.com',
        city: 'Ciudad Principal',
        country: 'Perú',
        status: BranchStatus.ACTIVE,
      },
    }),
    prisma.branch.upsert({
      where: { id: 'branch-2' },
      update: {},
      create: {
        id: 'branch-2',
        name: 'Sucursal Norte',
        code: 'NORTH',
        address: 'Av. Norte 456',
        phoneNumber: '+1234567891',
        email: 'north@stl.com',
        city: 'Ciudad Norte',
        country: 'Perú',
        status: BranchStatus.ACTIVE,
      },
    }),
    prisma.branch.upsert({
      where: { id: 'branch-3' },
      update: {},
      create: {
        id: 'branch-3',
        name: 'Sucursal Sur',
        code: 'SOUTH',
        address: 'Av. Sur 789',
        phoneNumber: '+1234567892',
        email: 'south@stl.com',
        city: 'Ciudad Sur',
        country: 'Perú',
        status: BranchStatus.ACTIVE,
      },
    }),
  ]);
  console.log(`✅ Created ${branches.length} branches`);

  // Create Specializations
  console.log('📋 Creating specializations...');
  const specializations = await Promise.all([
    prisma.specialization.upsert({
      where: { id: 'spec-1' },
      update: {},
      create: {
        id: 'spec-1',
        name: 'Odontología General',
        description: 'Especialización en odontología general y preventiva',
      },
    }),
    prisma.specialization.upsert({
      where: { id: 'spec-2' },
      update: {},
      create: {
        id: 'spec-2',
        name: 'Ortodoncia',
        description: 'Especialización en corrección de malposiciones dentarias',
      },
    }),
    prisma.specialization.upsert({
      where: { id: 'spec-3' },
      update: {},
      create: {
        id: 'spec-3',
        name: 'Endodoncia',
        description: 'Especialización en tratamiento de conductos radiculares',
      },
    }),
    prisma.specialization.upsert({
      where: { id: 'spec-4' },
      update: {},
      create: {
        id: 'spec-4',
        name: 'Periodoncia',
        description: 'Especialización en enfermedades de las encías',
      },
    }),
    prisma.specialization.upsert({
      where: { id: 'spec-5' },
      update: {},
      create: {
        id: 'spec-5',
        name: 'Cirugía Oral',
        description: 'Especialización en cirugía maxilofacial y oral',
      },
    }),
    prisma.specialization.upsert({
      where: { id: 'spec-6' },
      update: {},
      create: {
        id: 'spec-6',
        name: 'Odontopediatría',
        description: 'Especialización en odontología infantil',
      },
    }),
    prisma.specialization.upsert({
      where: { id: 'spec-7' },
      update: {},
      create: {
        id: 'spec-7',
        name: 'Prostodoncia',
        description: 'Especialización en rehabilitación oral y prótesis',
      },
    }),
    prisma.specialization.upsert({
      where: { id: 'spec-8' },
      update: {},
      create: {
        id: 'spec-8',
        name: 'Radiología Oral',
        description: 'Especialización en diagnóstico por imágenes',
      },
    }),
  ]);
  console.log(`✅ Created ${specializations.length} specializations`);

  // Create Admin User
  console.log('👤 Creating admin user...');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@stl.com' },
    update: {},
    create: {
      email: 'admin@stl.com',
      fullName: 'Administrator',
      password: hashedPassword,
      role: UserRole.SUPERADMIN,
      gender: Gender.OTHER,
      status: UserStatus.ACTIVE,
      phoneNumber: '+1234567890',
      dni: 'ADMIN001',
      address: 'STL Lab Headquarters',
      defaultBranchId: 'branch-1',
    },
  });
  console.log(`✅ Created admin user: ${adminUser.email}`);

  // Assign all branches to admin user (SUPERADMIN has access to all branches)
  console.log('🔗 Assigning branches to admin user...');
  for (const branch of branches) {
    await prisma.userBranch.upsert({
      where: {
        userId_branchId: {
          userId: adminUser.id,
          branchId: branch.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        branchId: branch.id,
      },
    });
  }
  console.log(`✅ Assigned ${branches.length} branches to admin user`);

  // Create Appointment Types
  console.log('📅 Creating appointment types...');
  const appointmentTypes = await Promise.all([
    prisma.appointmentType.upsert({
      where: { id: 'apt-type-1' },
      update: {},
      create: {
        id: 'apt-type-1',
        name: 'Consulta Inicial',
        description: 'Primera consulta y evaluación del paciente',
      },
    }),
    prisma.appointmentType.upsert({
      where: { id: 'apt-type-2' },
      update: {},
      create: {
        id: 'apt-type-2',
        name: 'Control de Rutina',
        description: 'Revisión periódica y limpieza dental',
      },
    }),
    prisma.appointmentType.upsert({
      where: { id: 'apt-type-3' },
      update: {},
      create: {
        id: 'apt-type-3',
        name: 'Urgencia',
        description: 'Atención de urgencia por dolor o trauma',
      },
    }),
    prisma.appointmentType.upsert({
      where: { id: 'apt-type-4' },
      update: {},
      create: {
        id: 'apt-type-4',
        name: 'Tratamiento',
        description: 'Sesión de tratamiento programado',
      },
    }),
    prisma.appointmentType.upsert({
      where: { id: 'apt-type-5' },
      update: {},
      create: {
        id: 'apt-type-5',
        name: 'Seguimiento',
        description: 'Control post-tratamiento',
      },
    }),
    prisma.appointmentType.upsert({
      where: { id: 'apt-type-6' },
      update: {},
      create: {
        id: 'apt-type-6',
        name: 'Cirugía',
        description: 'Procedimiento quirúrgico programado',
      },
    }),
    prisma.appointmentType.upsert({
      where: { id: 'apt-type-7' },
      update: {},
      create: {
        id: 'apt-type-7',
        name: 'Ortodoncia',
        description: 'Ajuste y control de aparatos de ortodoncia',
      },
    }),
    prisma.appointmentType.upsert({
      where: { id: 'apt-type-8' },
      update: {},
      create: {
        id: 'apt-type-8',
        name: 'Radiografía',
        description: 'Toma de radiografías y estudios de imagen',
      },
    }),
  ]);
  console.log(`✅ Created ${appointmentTypes.length} appointment types`);

  console.log('✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
