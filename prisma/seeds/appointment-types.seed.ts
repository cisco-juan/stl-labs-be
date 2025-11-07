import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const appointmentTypes = [
  {
    name: 'Consulta',
    description: 'Consulta general o revisión',
  },
  {
    name: 'Limpieza',
    description: 'Limpieza dental profesional',
  },
  {
    name: 'Endodoncia',
    description: 'Tratamiento de conducto',
  },
  {
    name: 'Ortodoncia',
    description: 'Tratamiento de ortodoncia',
  },
  {
    name: 'Cirugía',
    description: 'Procedimiento quirúrgico dental',
  },
  {
    name: 'Extracción',
    description: 'Extracción dental',
  },
  {
    name: 'Radiografía',
    description: 'Toma de radiografías',
  },
  {
    name: 'Control',
    description: 'Control post-tratamiento',
  },
  {
    name: 'Emergencia',
    description: 'Atención de emergencia',
  },
  {
    name: 'Otro',
    description: 'Otro tipo de cita',
  },
];

async function seedAppointmentTypes() {
  console.log('🌱 Seeding appointment types...');

  for (const type of appointmentTypes) {
    const existing = await prisma.appointmentType.findFirst({
      where: { name: type.name },
    });

    if (!existing) {
      await prisma.appointmentType.create({
        data: type,
      });
      console.log(`✅ Created appointment type: ${type.name}`);
    } else {
      console.log(`⏭️  Appointment type already exists: ${type.name}`);
    }
  }

  console.log('✨ Appointment types seed completed!');
}

// Run seed
seedAppointmentTypes()
  .catch((e) => {
    console.error('❌ Error seeding appointment types:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export { seedAppointmentTypes };
