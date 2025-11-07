import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { PatientsService } from './patients.service';
import {
  CreatePatientDto,
  UpdatePatientDto,
  PatientQueryDto,
  PatientResponseDto,
  PaginatedPatientResponseDto,
  PatientStatsDto,
  CreateEmergencyContactDto,
  CreateMedicalHistoryDto,
  UpdateMedicalHistoryDto,
  MedicalHistoryResponseDto,
  UpdateOdontogramDto,
  OdontogramResponseDto,
  UploadDocumentDto,
  PatientDocumentResponseDto,
  PaginatedDocumentResponseDto,
} from './dto';

@ApiTags('Pacientes')
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  // ==================== BASIC CRUD ====================

  @Post()
  @ApiOperation({ summary: 'Crear nuevo paciente' })
  @ApiResponse({
    status: 201,
    description: 'Paciente creado exitosamente',
    type: PatientResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email o DNI ya registrado' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createPatientDto: CreatePatientDto,
  ): Promise<PatientResponseDto> {
    return this.patientsService.create(createPatientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pacientes con filtros y paginación' })
  @ApiResponse({
    status: 200,
    description: 'Lista de pacientes',
    type: PaginatedPatientResponseDto,
  })
  async findAll(
    @Query() query: PatientQueryDto,
  ): Promise<PaginatedPatientResponseDto> {
    return this.patientsService.findAll(query);
  }

  @Get('export/csv')
  @ApiOperation({ summary: 'Exportar pacientes a CSV' })
  @ApiResponse({
    status: 200,
    description: 'Archivo CSV con los pacientes',
  })
  async exportCsv(@Query() query: PatientQueryDto, @Res() res: Response) {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="pacientes_${new Date().toISOString()}.csv"`,
    );

    // Stream CSV data in batches
    for await (const chunk of this.patientsService.exportToCsv(query)) {
      res.write(chunk);
    }

    res.end();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de un paciente' })
  @ApiParam({ name: 'id', description: 'ID del paciente' })
  @ApiResponse({
    status: 200,
    description: 'Detalles del paciente',
    type: PatientResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PatientResponseDto> {
    return this.patientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar paciente' })
  @ApiParam({ name: 'id', description: 'ID del paciente' })
  @ApiResponse({
    status: 200,
    description: 'Paciente actualizado exitosamente',
    type: PatientResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ): Promise<PatientResponseDto> {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar paciente (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID del paciente' })
  @ApiResponse({
    status: 200,
    description: 'Paciente eliminado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Paciente no encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.patientsService.remove(id);
  }

  // ==================== PATIENT STATS ====================

  @Get(':id/stats')
  @ApiOperation({ summary: 'Obtener estadísticas del paciente' })
  @ApiParam({ name: 'id', description: 'ID del paciente' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas del paciente',
    type: PatientStatsDto,
  })
  async getStats(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PatientStatsDto> {
    return this.patientsService.getStats(id);
  }

  // ==================== GENERAL INFO ====================

  @Get(':id/general-info')
  @ApiOperation({ summary: 'Obtener información general del paciente' })
  @ApiParam({ name: 'id', description: 'ID del paciente' })
  @ApiResponse({
    status: 200,
    description: 'Información general del paciente',
    type: PatientResponseDto,
  })
  async getGeneralInfo(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PatientResponseDto> {
    return this.patientsService.getGeneralInfo(id);
  }

  // ==================== EMERGENCY CONTACTS ====================

  @Post(':id/emergency-contacts')
  @ApiOperation({ summary: 'Agregar contacto de emergencia' })
  @ApiParam({ name: 'id', description: 'ID del paciente' })
  @ApiResponse({
    status: 201,
    description: 'Contacto de emergencia agregado',
  })
  @HttpCode(HttpStatus.CREATED)
  async addEmergencyContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() contactData: CreateEmergencyContactDto,
  ) {
    return this.patientsService.addEmergencyContact(id, contactData);
  }

  @Patch(':id/emergency-contacts/:contactId')
  @ApiOperation({ summary: 'Actualizar contacto de emergencia' })
  @ApiParam({ name: 'id', description: 'ID del paciente' })
  @ApiParam({ name: 'contactId', description: 'ID del contacto' })
  @ApiResponse({
    status: 200,
    description: 'Contacto de emergencia actualizado',
  })
  async updateEmergencyContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @Body() contactData: CreateEmergencyContactDto,
  ) {
    return this.patientsService.updateEmergencyContact(id, contactId, contactData);
  }

  @Delete(':id/emergency-contacts/:contactId')
  @ApiOperation({ summary: 'Eliminar contacto de emergencia' })
  @ApiParam({ name: 'id', description: 'ID del paciente' })
  @ApiParam({ name: 'contactId', description: 'ID del contacto' })
  @ApiResponse({
    status: 200,
    description: 'Contacto de emergencia eliminado',
  })
  async removeEmergencyContact(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('contactId', ParseUUIDPipe) contactId: string,
  ) {
    return this.patientsService.removeEmergencyContact(id, contactId);
  }

  // ==================== MEDICAL HISTORY ====================

  @Get(':id/medical-history')
  @ApiOperation({ summary: 'Obtener historia clínica del paciente' })
  @ApiParam({ name: 'id', description: 'ID del paciente' })
  @ApiResponse({
    status: 200,
    description: 'Historia clínica del paciente',
    type: MedicalHistoryResponseDto,
  })
  async getMedicalHistory(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MedicalHistoryResponseDto | null> {
    return this.patientsService.getMedicalHistory(id);
  }

  @Post(':id/medical-history')
  @ApiOperation({ summary: 'Crear o actualizar historia clínica' })
  @ApiParam({ name: 'id', description: 'ID del paciente' })
  @ApiResponse({
    status: 200,
    description: 'Historia clínica creada/actualizada',
    type: MedicalHistoryResponseDto,
  })
  async upsertMedicalHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: CreateMedicalHistoryDto,
  ): Promise<MedicalHistoryResponseDto> {
    return this.patientsService.upsertMedicalHistory(id, data);
  }

  // ==================== ODONTOGRAM ====================

  @Get(':id/odontogram')
  @ApiOperation({ summary: 'Obtener odontograma del paciente' })
  @ApiParam({ name: 'id', description: 'ID del paciente' })
  @ApiResponse({
    status: 200,
    description: 'Odontograma del paciente',
    type: OdontogramResponseDto,
  })
  async getOdontogram(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OdontogramResponseDto | null> {
    return this.patientsService.getOdontogram(id);
  }

  @Put(':id/odontogram')
  @ApiOperation({ summary: 'Actualizar odontograma del paciente' })
  @ApiParam({ name: 'id', description: 'ID del paciente' })
  @ApiResponse({
    status: 200,
    description: 'Odontograma actualizado',
    type: OdontogramResponseDto,
  })
  async updateOdontogram(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateOdontogramDto,
  ): Promise<OdontogramResponseDto> {
    return this.patientsService.updateOdontogram(id, data);
  }

  // ==================== TREATMENTS ====================

  @Get(':id/treatments')
  @ApiOperation({ summary: 'Obtener tratamientos del paciente' })
  @ApiParam({ name: 'id', description: 'ID del paciente' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Tratamientos del paciente',
  })
  async getTreatments(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.patientsService.getTreatments(id, page, limit);
  }

  // ==================== INVOICES ====================

  @Get(':id/invoices')
  @ApiOperation({ summary: 'Obtener facturas del paciente' })
  @ApiParam({ name: 'id', description: 'ID del paciente' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Facturas del paciente',
  })
  async getInvoices(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.patientsService.getInvoices(id, page, limit);
  }

  @Get(':id/invoices/:invoiceId')
  @ApiOperation({ summary: 'Obtener detalles de una factura' })
  @ApiParam({ name: 'id', description: 'ID del paciente' })
  @ApiParam({ name: 'invoiceId', description: 'ID de la factura' })
  @ApiResponse({
    status: 200,
    description: 'Detalles de la factura',
  })
  async getInvoiceDetails(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('invoiceId', ParseUUIDPipe) invoiceId: string,
  ) {
    return this.patientsService.getInvoiceDetails(id, invoiceId);
  }

  // ==================== DOCUMENTS ====================

  @Post(':id/documents')
  @ApiOperation({ summary: 'Subir documento del paciente' })
  @ApiParam({ name: 'id', description: 'ID del paciente' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        description: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Documento subido exitosamente',
    type: PatientDocumentResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('description') description?: string,
  ): Promise<PatientDocumentResponseDto> {
    return this.patientsService.uploadDocument(id, file, description);
  }

  @Get(':id/documents')
  @ApiOperation({ summary: 'Listar documentos del paciente' })
  @ApiParam({ name: 'id', description: 'ID del paciente' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de documentos',
    type: PaginatedDocumentResponseDto,
  })
  async getDocuments(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.patientsService.getDocuments(id, page, limit);
  }

  @Get(':id/documents/:documentId/download')
  @ApiOperation({ summary: 'Descargar documento' })
  @ApiParam({ name: 'id', description: 'ID del paciente' })
  @ApiParam({ name: 'documentId', description: 'ID del documento' })
  @ApiResponse({
    status: 200,
    description: 'Archivo descargado',
  })
  async downloadDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { buffer, fileName, mimeType } =
      await this.patientsService.downloadDocument(id, documentId);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });

    return new StreamableFile(buffer);
  }

  @Delete(':id/documents/:documentId')
  @ApiOperation({ summary: 'Eliminar documento' })
  @ApiParam({ name: 'id', description: 'ID del paciente' })
  @ApiParam({ name: 'documentId', description: 'ID del documento' })
  @ApiResponse({
    status: 200,
    description: 'Documento eliminado exitosamente',
  })
  async deleteDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('documentId', ParseUUIDPipe) documentId: string,
  ) {
    return this.patientsService.deleteDocument(id, documentId);
  }
}
