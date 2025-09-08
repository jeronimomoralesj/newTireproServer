// src/s3/s3.service.ts
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucketName = process.env.AWS_S3_BUCKET!;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  /**
   * Upload any file (image or PDF) to S3
   */
  async uploadFile(file: Express.Multer.File, folder = 'uploads'): Promise<string> {
    // Generate unique filename
    const fileExtension = this.getFileExtension(file.originalname || file.mimetype);
    const key = `${folder}/${uuid()}-${Date.now()}${fileExtension}`;

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          // Add metadata
          Metadata: {
            originalName: file.originalname || 'unknown',
            uploadDate: new Date().toISOString(),
          },
        }),
      );

      // Return the public URL
      return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  /**
   * Legacy method - kept for backward compatibility
   */
  async uploadImage(file: Express.Multer.File, folder = 'inspections'): Promise<string> {
    return this.uploadFile(file, folder);
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract the key from the URL
      const key = this.extractKeyFromUrl(fileUrl);
      
      if (!key) {
        console.warn('Invalid S3 URL provided for deletion:', fileUrl);
        return; // Don't throw error, just log warning
      }

      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      );
      
      console.log('Successfully deleted file from S3:', key);
    } catch (error) {
      console.error('S3 delete error:', error);
      
      // Check if it's an access denied error
      if (error.Code === 'AccessDenied' || error.name === 'AccessDenied') {
        console.warn(
          'Delete operation failed due to insufficient permissions. File may remain in S3:',
          fileUrl
        );
        // Don't throw error for permission issues during cleanup
        return;
      }
      
      // For other errors, we still don't want to break the main operation
      console.warn(`Failed to delete file from S3: ${error.message}`);
    }
  }

  /**
   * Get file extension from filename or mimetype
   */
  private getFileExtension(filename: string): string {
    // First try to get extension from filename
    if (filename && filename.includes('.')) {
      const parts = filename.split('.');
      return `.${parts[parts.length - 1].toLowerCase()}`;
    }

    // Fallback to mimetype mapping
    const mimeTypeMap: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/bmp': '.bmp',
      'image/tiff': '.tiff',
      'image/webp': '.webp',
      'application/pdf': '.pdf',
    };

    return mimeTypeMap[filename] || '.bin';
  }

  /**
   * Extract S3 key from full URL
   */
  private extractKeyFromUrl(url: string): string | null {
    try {
      const urlPattern = new RegExp(
        `https://${this.bucketName}\\.s3\\.${process.env.AWS_REGION}\\.amazonaws\\.com/(.+)`
      );
      const match = url.match(urlPattern);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if file type is supported
   */
  isSupportedFileType(mimetype: string): boolean {
    const supportedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/bmp',
      'image/tiff',
      'image/webp',
      'application/pdf',
    ];

    return supportedTypes.includes(mimetype);
  }

  /**
   * Get file size in human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}