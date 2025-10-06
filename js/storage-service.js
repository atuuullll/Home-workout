import { Storage } from '@google-cloud/storage';
import gcsConfig from './gcs-config.js';

class StorageService {
  constructor() {
    this.storage = new Storage({
      projectId: gcsConfig.projectId,
      credentials: gcsConfig.credentials
    });
    this.bucket = this.storage.bucket(gcsConfig.bucket);
  }

  async uploadFile(file, destination) {
    try {
      const blob = this.bucket.file(destination);
      const blobStream = blob.createWriteStream({
        resumable: false
      });

      return new Promise((resolve, reject) => {
        blobStream.on('error', (error) => {
          reject(error);
        });

        blobStream.on('finish', () => {
          const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${blob.name}`;
          resolve(publicUrl);
        });

        blobStream.end(file.buffer);
      });
    } catch (error) {
      throw new Error(`Error uploading file: ${error.message}`);
    }
  }

  async downloadFile(fileName) {
    try {
      const file = this.bucket.file(fileName);
      const [exists] = await file.exists();
      
      if (!exists) {
        throw new Error('File does not exist');
      }

      const [fileContent] = await file.download();
      return fileContent;
    } catch (error) {
      throw new Error(`Error downloading file: ${error.message}`);
    }
  }

  async deleteFile(fileName) {
    try {
      const file = this.bucket.file(fileName);
      await file.delete();
    } catch (error) {
      throw new Error(`Error deleting file: ${error.message}`);
    }
  }

  async listFiles(prefix = '') {
    try {
      const [files] = await this.bucket.getFiles({ prefix });
      return files.map(file => ({
        name: file.name,
        url: `https://storage.googleapis.com/${this.bucket.name}/${file.name}`
      }));
    } catch (error) {
      throw new Error(`Error listing files: ${error.message}`);
    }
  }
}

export const storageService = new StorageService();