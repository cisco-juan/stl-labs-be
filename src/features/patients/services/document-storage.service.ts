import { Injectable, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * DocumentStorageService
 *
 * Simulates S3 file storage locally using the file system.
 *
 * TODO: Migrate to AWS S3
 * This service currently stores files locally in /uploads/patients/{patientId}/
 * For production, this should be migrated to AWS S3:
 *
 * Migration steps:
 * 1. Install AWS SDK: npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 * 2. Configure AWS credentials (access key, secret key, region)
 * 3. Create S3 bucket with proper CORS policy
 * 4. Replace local file operations with S3 SDK methods:
 *    - uploadFile() -> s3.putObject()
 *    - downloadFile() -> s3.getObject()
 *    - deleteFile() -> s3.deleteObject()
 *    - getFileUrl() -> getSignedUrl() for secure access
 * 5. Set up bucket lifecycle policies for automatic cleanup/archival
 * 6. Implement file migration script to move existing local files to S3
 */
@Injectable()
export class DocumentStorageService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'patients');

  constructor() {
    this.ensureUploadDirectoryExists();
  }

  /**
   * Ensures the upload directory exists
   */
  private async ensureUploadDirectoryExists() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Uploads a file for a specific patient
   * @param patientId - Patient UUID
   * @param file - File buffer
   * @param fileName - Original file name
   * @returns Object with fileKey and fileUrl
   */
  async uploadFile(
    patientId: string,
    file: Buffer,
    fileName: string,
  ): Promise<{ fileKey: string; fileUrl: string }> {
    const patientDir = path.join(this.uploadDir, patientId);

    // Ensure patient directory exists
    try {
      await fs.access(patientDir);
    } catch {
      await fs.mkdir(patientDir, { recursive: true });
    }

    // Generate unique file key
    const fileExtension = path.extname(fileName);
    const fileKey = `${patientId}/${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.uploadDir, fileKey);

    // Write file
    await fs.writeFile(filePath, file);

    // In production with S3, this would be the S3 URL
    const fileUrl = `/uploads/patients/${fileKey}`;

    return { fileKey, fileUrl };
  }

  /**
   * Downloads a file by its key
   * @param fileKey - File key (patientId/filename)
   * @returns File buffer
   */
  async downloadFile(fileKey: string): Promise<Buffer> {
    const filePath = path.join(this.uploadDir, fileKey);

    try {
      return await fs.readFile(filePath);
    } catch (error) {
      throw new NotFoundException('Archivo no encontrado');
    }
  }

  /**
   * Deletes a file by its key
   * @param fileKey - File key (patientId/filename)
   */
  async deleteFile(fileKey: string): Promise<void> {
    const filePath = path.join(this.uploadDir, fileKey);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      throw new NotFoundException('Archivo no encontrado');
    }
  }

  /**
   * Gets the URL for a file
   * In S3, this would generate a presigned URL
   * @param fileKey - File key
   * @returns File URL
   */
  getFileUrl(fileKey: string): string {
    return `/uploads/patients/${fileKey}`;
  }

  /**
   * Checks if a file exists
   * @param fileKey - File key
   * @returns True if exists
   */
  async fileExists(fileKey: string): Promise<boolean> {
    const filePath = path.join(this.uploadDir, fileKey);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
