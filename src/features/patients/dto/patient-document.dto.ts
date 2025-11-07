import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UploadDocumentDto {
  @ApiPropertyOptional({
    example: 'Radiografía panorámica del 15/01/2024',
    description: 'Descripción del documento',
  })
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsOptional()
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  description?: string;
}

export class PatientDocumentResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d' })
  id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d' })
  patientId: string;

  @ApiProperty({ example: 'radiografia_panoramica.pdf' })
  fileName: string;

  @ApiProperty({ example: 'patient-id/uuid-file.pdf' })
  fileKey: string;

  @ApiPropertyOptional({ example: '/uploads/patients/patient-id/uuid-file.pdf' })
  fileUrl?: string | null;

  @ApiProperty({ example: 'application/pdf' })
  mimeType: string;

  @ApiProperty({ example: 2048576, description: 'Tamaño en bytes' })
  fileSize: number;

  @ApiPropertyOptional({ example: 'Radiografía panorámica' })
  description?: string | null;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  uploadedAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;
}

export class PaginatedDocumentResponseDto {
  @ApiProperty({ type: [PatientDocumentResponseDto] })
  data: PatientDocumentResponseDto[];

  @ApiProperty({
    example: {
      total: 25,
      page: 1,
      limit: 10,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: false,
    },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
