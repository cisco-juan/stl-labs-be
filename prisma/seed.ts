import { PrismaClient, UserRole, UserStatus, Gender, BranchStatus, Language, DayOfWeek } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Hash the admin password
  const hashedPassword = await bcrypt.hash('6366aaee36', 10);

  // Create Currencies
  console.log('💰 Creating currencies...');
  const currencies = await Promise.all([
    prisma.currency.upsert({
      where: { code: 'USD' },
      update: {},
      create: { code: 'USD', name: 'US Dollar', symbol: '$' },
    }),
    prisma.currency.upsert({
      where: { code: 'EUR' },
      update: {},
      create: { code: 'EUR', name: 'Euro', symbol: '€' },
    }),
    prisma.currency.upsert({
      where: { code: 'DOP' },
      update: {},
      create: { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$' },
    }),
    prisma.currency.upsert({
      where: { code: 'MXN' },
      update: {},
      create: { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
    }),
    prisma.currency.upsert({
      where: { code: 'COP' },
      update: {},
      create: { code: 'COP', name: 'Colombian Peso', symbol: 'COL$' },
    }),
    prisma.currency.upsert({
      where: { code: 'ARS' },
      update: {},
      create: { code: 'ARS', name: 'Argentine Peso', symbol: 'AR$' },
    }),
    prisma.currency.upsert({
      where: { code: 'CLP' },
      update: {},
      create: { code: 'CLP', name: 'Chilean Peso', symbol: 'CL$' },
    }),
    prisma.currency.upsert({
      where: { code: 'PEN' },
      update: {},
      create: { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/' },
    }),
    prisma.currency.upsert({
      where: { code: 'BRL' },
      update: {},
      create: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    }),
    prisma.currency.upsert({
      where: { code: 'GTQ' },
      update: {},
      create: { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q' },
    }),
  ]);
  console.log(`✅ Created ${currencies.length} currencies`);

  // Create Timezones (popular ones)
  console.log('🌍 Creating timezones...');
  const timezones = await Promise.all([
    prisma.timezone.upsert({
      where: { code: 'America/New_York' },
      update: {},
      create: { code: 'America/New_York', name: 'Eastern Time (US & Canada)', offsetHours: -5, offsetMinutes: 0 },
    }),
    prisma.timezone.upsert({
      where: { code: 'America/Chicago' },
      update: {},
      create: { code: 'America/Chicago', name: 'Central Time (US & Canada)', offsetHours: -6, offsetMinutes: 0 },
    }),
    prisma.timezone.upsert({
      where: { code: 'America/Denver' },
      update: {},
      create: { code: 'America/Denver', name: 'Mountain Time (US & Canada)', offsetHours: -7, offsetMinutes: 0 },
    }),
    prisma.timezone.upsert({
      where: { code: 'America/Los_Angeles' },
      update: {},
      create: { code: 'America/Los_Angeles', name: 'Pacific Time (US & Canada)', offsetHours: -8, offsetMinutes: 0 },
    }),
    prisma.timezone.upsert({
      where: { code: 'America/Santo_Domingo' },
      update: {},
      create: { code: 'America/Santo_Domingo', name: 'Atlantic Time - Dominican Republic', offsetHours: -4, offsetMinutes: 0 },
    }),
    prisma.timezone.upsert({
      where: { code: 'America/Mexico_City' },
      update: {},
      create: { code: 'America/Mexico_City', name: 'Central Time - Mexico City', offsetHours: -6, offsetMinutes: 0 },
    }),
    prisma.timezone.upsert({
      where: { code: 'America/Bogota' },
      update: {},
      create: { code: 'America/Bogota', name: 'Colombia Time', offsetHours: -5, offsetMinutes: 0 },
    }),
    prisma.timezone.upsert({
      where: { code: 'America/Lima' },
      update: {},
      create: { code: 'America/Lima', name: 'Peru Time', offsetHours: -5, offsetMinutes: 0 },
    }),
    prisma.timezone.upsert({
      where: { code: 'America/Buenos_Aires' },
      update: {},
      create: { code: 'America/Buenos_Aires', name: 'Argentina Time', offsetHours: -3, offsetMinutes: 0 },
    }),
    prisma.timezone.upsert({
      where: { code: 'America/Santiago' },
      update: {},
      create: { code: 'America/Santiago', name: 'Chile Time', offsetHours: -3, offsetMinutes: 0 },
    }),
    prisma.timezone.upsert({
      where: { code: 'America/Sao_Paulo' },
      update: {},
      create: { code: 'America/Sao_Paulo', name: 'Brasilia Time', offsetHours: -3, offsetMinutes: 0 },
    }),
    prisma.timezone.upsert({
      where: { code: 'Europe/London' },
      update: {},
      create: { code: 'Europe/London', name: 'Greenwich Mean Time', offsetHours: 0, offsetMinutes: 0 },
    }),
    prisma.timezone.upsert({
      where: { code: 'Europe/Madrid' },
      update: {},
      create: { code: 'Europe/Madrid', name: 'Central European Time - Madrid', offsetHours: 1, offsetMinutes: 0 },
    }),
    prisma.timezone.upsert({
      where: { code: 'UTC' },
      update: {},
      create: { code: 'UTC', name: 'Coordinated Universal Time', offsetHours: 0, offsetMinutes: 0 },
    }),
  ]);
  console.log(`✅ Created ${timezones.length} timezones`);

  // Create Date Formats
  console.log('📅 Creating date formats...');
  const dateFormats = await Promise.all([
    prisma.dateFormat.upsert({
      where: { code: 'DD/MM/YYYY' },
      update: {},
      create: { code: 'DD/MM/YYYY', format: 'DD/MM/YYYY', example: '31/12/2024' },
    }),
    prisma.dateFormat.upsert({
      where: { code: 'MM/DD/YYYY' },
      update: {},
      create: { code: 'MM/DD/YYYY', format: 'MM/DD/YYYY', example: '12/31/2024' },
    }),
    prisma.dateFormat.upsert({
      where: { code: 'YYYY-MM-DD' },
      update: {},
      create: { code: 'YYYY-MM-DD', format: 'YYYY-MM-DD', example: '2024-12-31' },
    }),
    prisma.dateFormat.upsert({
      where: { code: 'DD-MM-YYYY' },
      update: {},
      create: { code: 'DD-MM-YYYY', format: 'DD-MM-YYYY', example: '31-12-2024' },
    }),
    prisma.dateFormat.upsert({
      where: { code: 'DD.MM.YYYY' },
      update: {},
      create: { code: 'DD.MM.YYYY', format: 'DD.MM.YYYY', example: '31.12.2024' },
    }),
    prisma.dateFormat.upsert({
      where: { code: 'YYYY/MM/DD' },
      update: {},
      create: { code: 'YYYY/MM/DD', format: 'YYYY/MM/DD', example: '2024/12/31' },
    }),
  ]);
  console.log(`✅ Created ${dateFormats.length} date formats`);

  // Create Time Formats
  console.log('🕐 Creating time formats...');
  const timeFormats = await Promise.all([
    prisma.timeFormat.upsert({
      where: { code: '24H' },
      update: {},
      create: { code: '24H', format: 'HH:mm', example: '23:59' },
    }),
    prisma.timeFormat.upsert({
      where: { code: '12H' },
      update: {},
      create: { code: '12H', format: 'hh:mm A', example: '11:59 PM' },
    }),
  ]);
  console.log(`✅ Created ${timeFormats.length} time formats`);

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

  // Create Treatment Categories
  console.log('🏷️ Creating treatment categories...');
  const treatmentCategories = await Promise.all([
    prisma.treatmentCategory.upsert({
      where: { id: 'tcat-1' },
      update: {},
      create: {
        id: 'tcat-1',
        name: 'Odontología General',
        description: 'Tratamientos básicos de odontología general y preventiva',
        isActive: true,
      },
    }),
    prisma.treatmentCategory.upsert({
      where: { id: 'tcat-2' },
      update: {},
      create: {
        id: 'tcat-2',
        name: 'Ortodoncia',
        description: 'Tratamientos de corrección de malposiciones dentarias',
        isActive: true,
      },
    }),
    prisma.treatmentCategory.upsert({
      where: { id: 'tcat-3' },
      update: {},
      create: {
        id: 'tcat-3',
        name: 'Endodoncia',
        description: 'Tratamientos de conductos radiculares',
        isActive: true,
      },
    }),
    prisma.treatmentCategory.upsert({
      where: { id: 'tcat-4' },
      update: {},
      create: {
        id: 'tcat-4',
        name: 'Periodoncia',
        description: 'Tratamientos de enfermedades de las encías',
        isActive: true,
      },
    }),
    prisma.treatmentCategory.upsert({
      where: { id: 'tcat-5' },
      update: {},
      create: {
        id: 'tcat-5',
        name: 'Cirugía Oral',
        description: 'Procedimientos quirúrgicos orales y maxilofaciales',
        isActive: true,
      },
    }),
    prisma.treatmentCategory.upsert({
      where: { id: 'tcat-6' },
      update: {},
      create: {
        id: 'tcat-6',
        name: 'Prostodoncia',
        description: 'Prótesis dentales y rehabilitación oral',
        isActive: true,
      },
    }),
    prisma.treatmentCategory.upsert({
      where: { id: 'tcat-7' },
      update: {},
      create: {
        id: 'tcat-7',
        name: 'Estética Dental',
        description: 'Tratamientos estéticos y blanqueamiento dental',
        isActive: true,
      },
    }),
    prisma.treatmentCategory.upsert({
      where: { id: 'tcat-8' },
      update: {},
      create: {
        id: 'tcat-8',
        name: 'Odontopediatría',
        description: 'Tratamientos dentales para niños',
        isActive: true,
      },
    }),
  ]);
  console.log(`✅ Created ${treatmentCategories.length} treatment categories`);

  // Create Clinic Settings
  console.log('⚙️ Creating clinic settings...');
  const clinicSettings = await prisma.clinicSettings.upsert({
    where: { id: 'clinic-settings-1' },
    update: {},
    create: {
      id: 'clinic-settings-1',
      name: 'STL Laboratory',
      legalName: 'STL Medical Laboratory Inc.',
      taxId: '123-45-6789',
      mainPhone: '+1 (555) 123-4567',
      email: 'contact@stl-lab.com',
      website: 'https://www.stl-lab.com',
      address: '123 Medical Center Drive, Suite 100, City, State 12345',
      defaultLanguage: Language.SPANISH,
      defaultTimezoneId: timezones.find(tz => tz.code === 'America/Santo_Domingo')?.id,
      defaultCurrencyId: currencies.find(c => c.code === 'DOP')?.id,
      dateFormatId: dateFormats.find(df => df.code === 'DD/MM/YYYY')?.id,
      timeFormatId: timeFormats.find(tf => tf.code === '12H')?.id,
    },
  });
  console.log(`✅ Created clinic settings: ${clinicSettings.name}`);

  // Create Business Hours
  console.log('🕐 Creating business hours...');
  const businessHours = await Promise.all([
    prisma.businessHours.upsert({
      where: {
        clinicSettingsId_dayOfWeek: {
          clinicSettingsId: clinicSettings.id,
          dayOfWeek: DayOfWeek.MONDAY,
        },
      },
      update: {},
      create: {
        clinicSettingsId: clinicSettings.id,
        dayOfWeek: DayOfWeek.MONDAY,
        isOpen: true,
        openTime: '08:00',
        closeTime: '17:00',
      },
    }),
    prisma.businessHours.upsert({
      where: {
        clinicSettingsId_dayOfWeek: {
          clinicSettingsId: clinicSettings.id,
          dayOfWeek: DayOfWeek.TUESDAY,
        },
      },
      update: {},
      create: {
        clinicSettingsId: clinicSettings.id,
        dayOfWeek: DayOfWeek.TUESDAY,
        isOpen: true,
        openTime: '08:00',
        closeTime: '17:00',
      },
    }),
    prisma.businessHours.upsert({
      where: {
        clinicSettingsId_dayOfWeek: {
          clinicSettingsId: clinicSettings.id,
          dayOfWeek: DayOfWeek.WEDNESDAY,
        },
      },
      update: {},
      create: {
        clinicSettingsId: clinicSettings.id,
        dayOfWeek: DayOfWeek.WEDNESDAY,
        isOpen: true,
        openTime: '08:00',
        closeTime: '17:00',
      },
    }),
    prisma.businessHours.upsert({
      where: {
        clinicSettingsId_dayOfWeek: {
          clinicSettingsId: clinicSettings.id,
          dayOfWeek: DayOfWeek.THURSDAY,
        },
      },
      update: {},
      create: {
        clinicSettingsId: clinicSettings.id,
        dayOfWeek: DayOfWeek.THURSDAY,
        isOpen: true,
        openTime: '08:00',
        closeTime: '17:00',
      },
    }),
    prisma.businessHours.upsert({
      where: {
        clinicSettingsId_dayOfWeek: {
          clinicSettingsId: clinicSettings.id,
          dayOfWeek: DayOfWeek.FRIDAY,
        },
      },
      update: {},
      create: {
        clinicSettingsId: clinicSettings.id,
        dayOfWeek: DayOfWeek.FRIDAY,
        isOpen: true,
        openTime: '08:00',
        closeTime: '17:00',
      },
    }),
    prisma.businessHours.upsert({
      where: {
        clinicSettingsId_dayOfWeek: {
          clinicSettingsId: clinicSettings.id,
          dayOfWeek: DayOfWeek.SATURDAY,
        },
      },
      update: {},
      create: {
        clinicSettingsId: clinicSettings.id,
        dayOfWeek: DayOfWeek.SATURDAY,
        isOpen: false,
        openTime: null,
        closeTime: null,
      },
    }),
    prisma.businessHours.upsert({
      where: {
        clinicSettingsId_dayOfWeek: {
          clinicSettingsId: clinicSettings.id,
          dayOfWeek: DayOfWeek.SUNDAY,
        },
      },
      update: {},
      create: {
        clinicSettingsId: clinicSettings.id,
        dayOfWeek: DayOfWeek.SUNDAY,
        isOpen: false,
        openTime: null,
        closeTime: null,
      },
    }),
  ]);
  console.log(`✅ Created ${businessHours.length} business hours`);

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
