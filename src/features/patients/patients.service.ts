import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, UserStatus } from '@prisma/client';
import {
  CreatePatientDto,
  UpdatePatientDto,
  PatientQueryDto,
  PatientResponseDto,
  PaginatedPatientResponseDto,
  PatientStatsDto,
  CreateMedicalHistoryDto,
  UpdateMedicalHistoryDto,
  MedicalHistoryResponseDto,
  UpdateOdontogramDto,
  OdontogramResponseDto,
  PatientDocumentResponseDto,
} from './dto';
import { DocumentStorageService } from './services/document-storage.service';

@Injectable()
export class PatientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly documentStorage: DocumentStorageService,
  ) {}

  /**
   * Creates a new patient
   */
  async create(createPatientDto: CreatePatientDto): Promise<PatientResponseDto> {
    const { firstName, lastName, emergencyContacts, birthDate, ...rest } = createPatientDto;

    // Validate unique email
    await this.validateUniqueEmail(rest.email);

    // Validate unique DNI if provided
    if (rest.dni) {
      await this.validateUniqueDni(rest.dni);
    }

    // Generate unique code
    const code = await this.generatePatientCode();

    // Build full name
    const fullName = `${firstName} ${lastName}`;

    // Create patient with emergency contacts
    const patient = await this.prisma.patient.create({
      data: {
        ...rest,
        code,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        fullName,
        PatientEmergencyContact: emergencyContacts
          ? {
              create: emergencyContacts,
            }
          : undefined,
      },
      include: {
        doctor: {
          select: {
            id: true,
            fullName: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        PatientEmergencyContact: true,
      },
    });

    return this.mapToPatientResponse(patient);
  }

  /**
   * Finds all patients with filters and pagination
   */
  async findAll(
    query: PatientQueryDto,
  ): Promise<PaginatedPatientResponseDto> {
    const {
      search,
      status,
      gender,
      civilStatus,
      doctorId,
      branchId,
      createdFrom,
      createdTo,
      lastVisitFrom,
      lastVisitTo,
      hasDentalInsurance,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    // Build where clause
    const where: Prisma.PatientWhereInput = {
      status: status || { not: UserStatus.DELETED },
    };

    // Search filter
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
        { dni: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Other filters
    if (gender) where.gender = gender;
    if (civilStatus) where.civilStatus = civilStatus;
    if (doctorId) where.doctorId = doctorId;
    if (branchId) where.branchId = branchId;
    if (hasDentalInsurance !== undefined) where.hasDentalInsurance = hasDentalInsurance;

    // Date filters
    if (createdFrom || createdTo) {
      where.createdAt = {};
      if (createdFrom) where.createdAt.gte = new Date(createdFrom);
      if (createdTo) where.createdAt.lte = new Date(createdTo);
    }

    if (lastVisitFrom || lastVisitTo) {
      where.lastVisit = {};
      if (lastVisitFrom) where.lastVisit.gte = new Date(lastVisitFrom);
      if (lastVisitTo) where.lastVisit.lte = new Date(lastVisitTo);
    }

    // Count total
    const total = await this.prisma.patient.count({ where });

    // Calculate pagination
    const skip = (+(page || 1) - 1) * +(limit || 10);
    const totalPages = Math.ceil(total / +(limit || 10));

    // Fetch patients
    const patients = await this.prisma.patient.findMany({
      where,
      skip,
      take: +(limit || 10),
      orderBy: { [sortBy]: sortOrder },
      include: {
        doctor: {
          select: {
            id: true,
            fullName: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        PatientEmergencyContact: true,
      },
    });

    return {
      data: patients.map((p) => this.mapToPatientResponse(p)),
      meta: {
        total,
        page: +(page || 1),
        limit: +(limit || 10),
        totalPages: Math.ceil(total / +(limit || 10)),
        hasNextPage: +(page || 1) < totalPages,
        hasPreviousPage: +(page || 1) > 1,
      },
    };
  }

  /**
   * Finds one patient by ID
   */
  async findOne(id: string): Promise<PatientResponseDto> {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        doctor: {
          select: {
            id: true,
            fullName: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        PatientEmergencyContact: true,
      },
    });

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    if (patient.status === UserStatus.DELETED) {
      throw new NotFoundException('Paciente no encontrado');
    }

    return this.mapToPatientResponse(patient);
  }

  /**
   * Updates a patient
   */
  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
  ): Promise<PatientResponseDto> {
    const { firstName, lastName, ...rest } = updatePatientDto;

    // Check if patient exists
    await this.findOne(id);

    // Validate unique email if changed
    if (rest.email) {
      await this.validateUniqueEmail(rest.email, id);
    }

    // Validate unique DNI if changed
    if (rest.dni) {
      await this.validateUniqueDni(rest.dni, id);
    }

    // Build full name if names provided
    const fullName =
      firstName || lastName
        ? `${firstName || ''} ${lastName || ''}`.trim()
        : undefined;

    // Update patient
    const patient = await this.prisma.patient.update({
      where: { id },
      data: {
        ...rest,
        ...(fullName && { fullName }),
      },
      include: {
        doctor: {
          select: {
            id: true,
            fullName: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        PatientEmergencyContact: true,
      },
    });

    return this.mapToPatientResponse(patient);
  }

  /**
   * Soft deletes a patient
   */
  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);

    await this.prisma.patient.update({
      where: { id },
      data: { status: UserStatus.DELETED },
    });

    return { message: 'Paciente eliminado exitosamente' };
  }

  /**
   * Gets patient statistics
   */
  async getStats(patientId: string): Promise<PatientStatsDto> {
    const patient = await this.findOne(patientId);

    // Calculate age
    const age = patient.birthDate ? this.calculateAge(patient.birthDate) : 0;

    // Count total visits (appointments)
    const totalVisits = await this.prisma.appointment.count({
      where: {
        patientId,
        status: { not: 'CANCELED' },
      },
    });

    // Calculate pending balance
    const invoices = await this.prisma.invoice.findMany({
      where: {
        patientId,
        isPaid: false,
        status: { notIn: ['CANCELED', 'DELETED'] },
      },
    });

    const pendingBalance = invoices.reduce((sum, invoice) => {
      return sum + (Number(invoice.totalAmount) - Number(invoice.paidAmount));
    }, 0);

    return {
      age,
      totalVisits,
      lastVisit: patient.lastVisit || undefined,
      pendingBalance,
    };
  }

  /**
   * Gets patient general information
   */
  async getGeneralInfo(patientId: string): Promise<PatientResponseDto> {
    return this.findOne(patientId);
  }

  // ==================== EMERGENCY CONTACTS ====================

  /**
   * Adds an emergency contact to a patient
   */
  async addEmergencyContact(
    patientId: string,
    contactData: any,
  ): Promise<any> {
    await this.findOne(patientId);

    return this.prisma.patientEmergencyContact.create({
      data: {
        ...contactData,
        patientId,
      },
    });
  }

  /**
   * Updates an emergency contact
   */
  async updateEmergencyContact(
    patientId: string,
    contactId: string,
    contactData: any,
  ): Promise<any> {
    await this.findOne(patientId);

    const contact = await this.prisma.patientEmergencyContact.findFirst({
      where: { id: contactId, patientId },
    });

    if (!contact) {
      throw new NotFoundException('Contacto de emergencia no encontrado');
    }

    return this.prisma.patientEmergencyContact.update({
      where: { id: contactId },
      data: contactData,
    });
  }

  /**
   * Deletes an emergency contact
   */
  async removeEmergencyContact(
    patientId: string,
    contactId: string,
  ): Promise<{ message: string }> {
    await this.findOne(patientId);

    const contact = await this.prisma.patientEmergencyContact.findFirst({
      where: { id: contactId, patientId },
    });

    if (!contact) {
      throw new NotFoundException('Contacto de emergencia no encontrado');
    }

    await this.prisma.patientEmergencyContact.delete({
      where: { id: contactId },
    });

    return { message: 'Contacto de emergencia eliminado exitosamente' };
  }

  // ==================== MEDICAL HISTORY ====================

  /**
   * Gets patient medical history
   */
  async getMedicalHistory(
    patientId: string,
  ): Promise<MedicalHistoryResponseDto | null> {
    await this.findOne(patientId);

    const medicalHistory = await this.prisma.medicalHistory.findUnique({
      where: { patientId },
    });

    if (!medicalHistory) {
      return null;
    }

    return {
      ...medicalHistory,
      chronicConditions: medicalHistory.chronicConditions || undefined,
      familyHistory: medicalHistory.familyHistory || undefined,
      habits: medicalHistory.habits || undefined,
      previousSurgeries: medicalHistory.previousSurgeries || undefined,
      consultationReason: medicalHistory.consultationReason || undefined,
      observations: medicalHistory.observations || undefined,
    };
  }

  /**
   * Creates or updates patient medical history
   */
  async upsertMedicalHistory(
    patientId: string,
    data: CreateMedicalHistoryDto | UpdateMedicalHistoryDto,
  ): Promise<MedicalHistoryResponseDto> {
    await this.findOne(patientId);

    const medicalHistory = await this.prisma.medicalHistory.upsert({
      where: { patientId },
      create: {
        ...data,
        patientId,
        allergies: data.allergies || [],
        currentMedications: data.currentMedications || [],
      },
      update: {
        ...data,
        ...(data.allergies && { allergies: data.allergies }),
        ...(data.currentMedications && { currentMedications: data.currentMedications }),
      },
    });

    if (!medicalHistory) {
      throw new NotFoundException('Historia clínica no encontrada');
    }

    return {
      ...medicalHistory,
      chronicConditions: medicalHistory.chronicConditions || undefined,
      familyHistory: medicalHistory.familyHistory || undefined,
      habits: medicalHistory.habits || undefined,
      previousSurgeries: medicalHistory.previousSurgeries || undefined,
      consultationReason: medicalHistory.consultationReason || undefined,
      observations: medicalHistory.observations || undefined,
    };
  }

  // ==================== ODONTOGRAM ====================

  /**
   * Gets patient odontogram
   */
  async getOdontogram(patientId: string): Promise<OdontogramResponseDto | null> {
    await this.findOne(patientId);

    const odontogram = await this.prisma.odontogram.findUnique({
      where: { patientId },
      include: {
        dentalPieces: {
          include: {
            surfaces: true,
          },
          orderBy: {
            pieceNumber: 'asc',
          },
        },
      },
    });

    if (!odontogram) {
      return null;
    }

    return {
      ...odontogram,
      observations: odontogram.observations || undefined,
      dentalPieces: odontogram.dentalPieces.map((dentalPiece) => ({
        ...dentalPiece,
        notes: dentalPiece.notes || undefined,
        surfaces: dentalPiece.surfaces.map((surface) => ({
          ...surface,
          condition: surface.condition || undefined,
        })),
      })),
    };
  }

  /**
   * Updates patient odontogram (creates if doesn't exist)
   */
  async updateOdontogram(
    patientId: string,
    data: UpdateOdontogramDto,
  ): Promise<OdontogramResponseDto> {
    await this.findOne(patientId);

    // Get or create odontogram
    let odontogram = await this.prisma.odontogram.findUnique({
      where: { patientId },
    });

    if (!odontogram) {
      odontogram = await this.prisma.odontogram.create({
        data: {
          patientId,
          observations: data.observations,
        },
      });
    } else if (data.observations) {
      odontogram = await this.prisma.odontogram.update({
        where: { id: odontogram.id },
        data: { observations: data.observations },
      });
    }

    // Update dental pieces
    for (const piece of data.dentalPieces) {
      // Upsert dental piece
      const dentalPiece = await this.prisma.dentalPiece.upsert({
        where: {
          odontogramId_pieceNumber: {
            odontogramId: odontogram.id,
            pieceNumber: piece.pieceNumber,
          },
        },
        create: {
          odontogramId: odontogram.id,
          pieceNumber: piece.pieceNumber,
          status: piece.status,
          notes: piece.notes,
        },
        update: {
          status: piece.status,
          notes: piece.notes,
        },
      });

      // Update surfaces if provided
      if (piece.surfaces && piece.surfaces.length > 0) {
        for (const surface of piece.surfaces) {
          await this.prisma.dentalSurface.upsert({
            where: {
              dentalPieceId_surfaceType: {
                dentalPieceId: dentalPiece.id,
                surfaceType: surface.surfaceType,
              },
            },
            create: {
              dentalPieceId: dentalPiece.id,
              surfaceType: surface.surfaceType,
              hasCondition: surface.hasCondition,
              condition: surface.condition,
            },
            update: {
              hasCondition: surface.hasCondition,
              condition: surface.condition,
            },
          });
        }
      }
    }

    // Return updated odontogram
    const updated = await this.prisma.odontogram.findUnique({
      where: { id: odontogram.id },
      include: {
        dentalPieces: {
          include: {
            surfaces: true,
          },
          orderBy: {
            pieceNumber: 'asc',
          },
        },
      },
    });

    if (!updated) {
      throw new NotFoundException('Odontograma no encontrado');
    }

    return {
      ...updated,
      observations: updated.observations || undefined,
      dentalPieces: updated.dentalPieces.map((dentalPiece) => ({
        ...dentalPiece,
        notes: dentalPiece.notes || undefined,
        surfaces: dentalPiece.surfaces.map((surface) => ({
          ...surface,
          condition: surface.condition || undefined,
        })),
      })),
    };
  }

  // ==================== TREATMENTS ====================

  /**
   * Gets patient treatments
   */
  async getTreatments(patientId: string, page = 1, limit = 10) {
    await this.findOne(patientId);

    const skip = (page - 1) * limit;
    const [treatments, total] = await Promise.all([
      this.prisma.treatment.findMany({
        where: {
          patientId,
          status: { not: 'DELETED' },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          doctor: {
            select: {
              fullName: true,
            },
          },
          TreatmentStep: true,
        },
      }),
      this.prisma.treatment.count({
        where: {
          patientId,
          status: { not: 'DELETED' },
        },
      }),
    ]);

    return {
      data: treatments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  // ==================== INVOICES ====================

  /**
   * Gets patient invoices
   */
  async getInvoices(patientId: string, page = 1, limit = 10) {
    await this.findOne(patientId);

    const skip = (page - 1) * limit;
    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where: {
          patientId,
          status: { not: 'DELETED' },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          doctor: {
            select: {
              fullName: true,
            },
          },
          branch: {
            select: {
              name: true,
            },
          },
        },
      }),
      this.prisma.invoice.count({
        where: {
          patientId,
          status: { not: 'DELETED' },
        },
      }),
    ]);

    return {
      data: invoices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Gets invoice details
   */
  async getInvoiceDetails(patientId: string, invoiceId: string) {
    await this.findOne(patientId);

    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        patientId,
      },
      include: {
        InvoiceItem: {
          include: {
            inventory: true,
          },
        },
        Payment: true,
        doctor: {
          select: {
            fullName: true,
          },
        },
        branch: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Factura no encontrada');
    }

    return invoice;
  }

  // ==================== DOCUMENTS ====================

  /**
   * Uploads a document for a patient
   */
  async uploadDocument(
    patientId: string,
    file: Express.Multer.File,
    description?: string,
  ): Promise<PatientDocumentResponseDto> {
    await this.findOne(patientId);

    // Upload file to storage
    const { fileKey, fileUrl } = await this.documentStorage.uploadFile(
      patientId,
      file.buffer,
      file.originalname,
    );

    // Save document metadata to database
    const document = await this.prisma.patientDocument.create({
      data: {
        patientId,
        fileName: file.originalname,
        fileKey,
        fileUrl,
        mimeType: file.mimetype,
        fileSize: file.size,
        description
      },
    });

    if (!document) {
      throw new NotFoundException('Documento no creado');
    }

    return {
      ...document,
      fileUrl: document.fileUrl || undefined,
      description: document.description || undefined,
      uploadedAt: document.uploadedAt,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }

  /**
   * Gets patient documents with pagination
   */
  async getDocuments(patientId: string, page = 1, limit = 10) {
    await this.findOne(patientId);

    const skip = (page - 1) * limit;
    const [documents, total] = await Promise.all([
      this.prisma.patientDocument.findMany({
        where: { patientId },
        skip,
        take: limit,
        orderBy: { uploadedAt: 'desc' },
      }),
      this.prisma.patientDocument.count({
        where: { patientId },
      }),
    ]);

    return {
      data: documents,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Downloads a document
   */
  async downloadDocument(patientId: string, documentId: string) {
    await this.findOne(patientId);

    const document = await this.prisma.patientDocument.findFirst({
      where: {
        id: documentId,
        patientId,
      },
    });

    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }

    const fileBuffer = await this.documentStorage.downloadFile(document.fileKey);

    return {
      buffer: fileBuffer,
      fileName: document.fileName,
      mimeType: document.mimeType,
    };
  }

  /**
   * Deletes a document
   */
  async deleteDocument(
    patientId: string,
    documentId: string,
  ): Promise<{ message: string }> {
    await this.findOne(patientId);

    const document = await this.prisma.patientDocument.findFirst({
      where: {
        id: documentId,
        patientId,
      },
    });

    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }

    // Delete from storage
    await this.documentStorage.deleteFile(document.fileKey);

    // Delete from database
    await this.prisma.patientDocument.delete({
      where: { id: documentId },
    });

    return { message: 'Documento eliminado exitosamente' };
  }

  // ==================== CSV EXPORT ====================

  /**
   * Exports patients to CSV in batches
   */
  async *exportToCsv(query: PatientQueryDto): AsyncGenerator<string> {
    const { sortBy = 'createdAt', sortOrder = 'desc', ...filters } = query;

    // Build where clause (same as findAll)
    const where: Prisma.PatientWhereInput = {
      status: filters.status || { not: UserStatus.DELETED },
    };

    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phoneNumber: { contains: filters.search, mode: 'insensitive' } },
        { dni: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.gender) where.gender = filters.gender;
    if (filters.civilStatus) where.civilStatus = filters.civilStatus;
    if (filters.doctorId) where.doctorId = filters.doctorId;
    if (filters.branchId) where.branchId = filters.branchId;
    if (filters.hasDentalInsurance !== undefined) where.hasDentalInsurance = filters.hasDentalInsurance;

    if (filters.createdFrom || filters.createdTo) {
      where.createdAt = {};
      if (filters.createdFrom) where.createdAt.gte = new Date(filters.createdFrom);
      if (filters.createdTo) where.createdAt.lte = new Date(filters.createdTo);
    }

    if (filters.lastVisitFrom || filters.lastVisitTo) {
      where.lastVisit = {};
      if (filters.lastVisitFrom) where.lastVisit.gte = new Date(filters.lastVisitFrom);
      if (filters.lastVisitTo) where.lastVisit.lte = new Date(filters.lastVisitTo);
    }

    // CSV Headers
    yield 'Nombre,Código,Identificación,Teléfono,Email,Edad,Última Visita,Estado\n';

    // Process in batches of 20
    const batchSize = 20;
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      const patients = await this.prisma.patient.findMany({
        where,
        skip,
        take: batchSize,
        orderBy: { [sortBy]: sortOrder },
      });

      if (patients.length === 0) {
        hasMore = false;
        break;
      }

      // Convert to CSV rows
      for (const patient of patients) {
        const age = patient.birthDate ? this.calculateAge(patient.birthDate) : '';
        const lastVisit = patient.lastVisit
          ? new Date(patient.lastVisit).toISOString().split('T')[0]
          : '';

        const row = [
          this.escapeCsvValue(patient.fullName),
          this.escapeCsvValue(patient.code || ''),
          this.escapeCsvValue(patient.dni || ''),
          this.escapeCsvValue(patient.phoneNumber || ''),
          this.escapeCsvValue(patient.email),
          age,
          lastVisit,
          patient.status,
        ].join(',');

        yield row + '\n';
      }

      skip += batchSize;
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Validates that email is unique
   */
  private async validateUniqueEmail(email: string, excludeId?: string) {
    const existing = await this.prisma.patient.findUnique({
      where: { email },
    });

    if (existing && existing.id !== excludeId) {
      throw new ConflictException('El email ya está registrado');
    }
  }

  /**
   * Validates that DNI is unique
   */
  private async validateUniqueDni(dni: string, excludeId?: string) {
    const existing = await this.prisma.patient.findFirst({
      where: { dni },
    });

    if (existing && existing.id !== excludeId) {
      throw new ConflictException('La identificación ya está registrada');
    }
  }

  /**
   * Generates a unique patient code
   */
  private async generatePatientCode(): Promise<string> {
    const count = await this.prisma.patient.count();
    const code = `PAC-${String(count + 1).padStart(6, '0')}`;

    // Check if code exists (unlikely but safe)
    const existing = await this.prisma.patient.findUnique({
      where: { code },
    });

    if (existing) {
      // Generate with timestamp if collision
      return `PAC-${Date.now()}`;
    }

    return code;
  }

  /**
   * Calculates age from birth date
   */
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Escapes CSV values
   */
  private escapeCsvValue(value: string): string {
    if (!value) return '';
    // Escape double quotes and wrap in quotes if contains comma, quote, or newline
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Maps patient to response DTO
   */
  private mapToPatientResponse(patient: any): PatientResponseDto {
    const age = patient.birthDate ? this.calculateAge(patient.birthDate) : undefined;

    return {
      id: patient.id,
      code: patient.code,
      fullName: patient.fullName,
      email: patient.email,
      phoneNumber: patient.phoneNumber,
      secondaryPhoneNumber: patient.secondaryPhoneNumber,
      dni: patient.dni,
      dniType: patient.dniType,
      birthDate: patient.birthDate,
      age,
      lastVisit: patient.lastVisit,
      civilStatus: patient.civilStatus,
      profession: patient.profession,
      address: patient.address,
      city: patient.city,
      hasDentalInsurance: patient.hasDentalInsurance,
      referralSource: patient.referralSource,
      notes: patient.notes,
      status: patient.status,
      gender: patient.gender,
      doctorId: patient.doctorId,
      doctorName: patient.doctor?.fullName,
      branchId: patient.branchId,
      branchName: patient.branch?.name,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
      emergencyContacts: patient.PatientEmergencyContact,
    };
  }
}
