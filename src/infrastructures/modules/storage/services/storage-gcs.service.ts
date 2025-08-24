import { Bucket, Storage } from '@google-cloud/storage';
import { Logger } from '@nestjs/common';
import { config } from 'src/config';
import { StorageDriverEnum } from 'src/shared/enums/storage-driver.enum';
import { IStorageFile } from 'src/shared/interfaces/storage-file.interface';
import { FileUtil } from 'src/shared/utils/file.util';
import { IStorageDriverService } from '../interfaces/storage-driver-service.interface';

/**
 * @description
 * StorageGcsService is a service for handling file storage operations using Google Cloud Storage (GCS).
 * It implements the IStorageDriverService interface, providing methods to upload, delete, and retrieve files.
 * This service is designed to work with GCS, allowing for scalable and reliable file storage in the cloud.
 * It supports file uploads, deletions, and URL generation for accessing files.
 */
export class StorageGcsService implements IStorageDriverService {
    private readonly storage: Storage;
    private readonly bucket: Bucket;
    private readonly logger: Logger;

    constructor(logger: Logger) {
        this.storage = new Storage({
            projectId: config.storage.gcs.projectId,
            keyFilename: config.storage.gcs.keyFilePath,
        });
        this.bucket = this.storage.bucket(config.storage.gcs.bucketName);
        this.logger = logger;
    }

    async uploadFile(file: Express.Multer.File): Promise<IStorageFile> {
        try {
            const rootPath = config.storage.rootPath;
            const fileName = FileUtil.generateUniqueFilename(file.originalname);
            const filePath = `${rootPath}/${fileName}`;

            // Create a new file in the bucket
            const gcsFile = this.bucket.file(filePath);

            // Upload the file buffer to GCS
            await gcsFile.save(file.buffer, {
                contentType: file.mimetype,
                resumable: false,
            });

            this.logger.log(`File uploaded successfully to GCS: ${filePath}`);

            return {
                name: fileName,
                path: filePath,
                size: file.size,
                mimetype: file.mimetype,
                driver: StorageDriverEnum.GCS,
            };
        } catch (error) {
            this.logger.error(`Failed to upload file to GCS: ${error.message}`);
            throw new Error(`Error uploading file to GCS: ${error.message}`);
        }
    }

    async deleteFile(filePath: string): Promise<void> {
        try {
            const gcsFile = this.bucket.file(filePath);

            // Check if the file exists before attempting to delete
            const [exists] = await gcsFile.exists();
            if (!exists) {
                this.logger.warn(`File not found in GCS: ${filePath}`);
                return;
            }

            // Delete the file from GCS
            await gcsFile.delete();

            this.logger.log(`File deleted successfully from GCS: ${filePath}`);
        } catch (error) {
            this.logger.error(
                `Failed to delete file from GCS: ${error.message}`,
            );
            throw new Error(`Error deleting file from GCS: ${error.message}`);
        }
    }

    async getFileUrl(filePath: string): Promise<string> {
        try {
            const file = this.bucket.file(filePath);

            const [url] = await file.getSignedUrl({
                version: 'v4',
                action: 'read',
                expires:
                    Date.now() +
                    config.storage.gcs.presignExpiresInSeconds * 1000,
            });

            this.logger.log(`Generated presigned URL for GCS file: ${url}`);

            return url;
        } catch (error) {
            this.logger.error(
                `Failed to get file URL from GCS: ${error.message}`,
            );
            throw new Error(
                `Error getting file URL from GCS: ${error.message}`,
            );
        }
    }
}
