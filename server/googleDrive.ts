import { google } from 'googleapis';
import { googleAuthService } from './googleAuth.js';

// Extract folder ID from Google Drive URL
const extractFolderIdFromUrl = (url: string): string => {
  const match = url.match(/\/folders\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : '';
};

export class GoogleDriveService {
  private drive: any;
  private folderId: string;
  private authClient: any;

  constructor() {
    // Your target folder ID
    this.folderId = extractFolderIdFromUrl('https://drive.google.com/drive/folders/1z5IXFZN7FHWRAJyCyJbD9G7sUKlr55td');
    this.authClient = googleAuthService.getAuthClient();
    this.drive = google.drive({ version: 'v3', auth: this.authClient });
    
    console.log('Google Drive service initialized');
  }

  async uploadReceiptPDF(pdfBuffer: Buffer, filename: string): Promise<{ success: boolean; fileId?: string; error?: string }> {
    if (!this.drive) {
      return { success: false, error: 'Google Drive not configured' };
    }

    try {
      console.log(`Uploading ${filename} to Google Drive folder: ${this.folderId}`);

      const fileMetadata = {
        name: filename,
        parents: [this.folderId], // Upload to your specific folder
      };

      const media = {
        mimeType: 'application/pdf',
        body: require('stream').Readable.from(pdfBuffer),
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id,name,webViewLink',
      });

      console.log(`Successfully uploaded to Google Drive: ${response.data.name} (ID: ${response.data.id})`);
      
      return {
        success: true,
        fileId: response.data.id,
      };
    } catch (error) {
      console.error('Google Drive upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async createReceiptFolder(folderName: string): Promise<{ success: boolean; folderId?: string; error?: string }> {
    if (!this.drive) {
      return { success: false, error: 'Google Drive not configured' };
    }

    try {
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [this.folderId], // Create inside your main folder
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        fields: 'id,name',
      });

      console.log(`Created folder in Google Drive: ${response.data.name} (ID: ${response.data.id})`);
      
      return {
        success: true,
        folderId: response.data.id,
      };
    } catch (error) {
      console.error('Google Drive folder creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async listFiles(): Promise<{ success: boolean; files?: any[]; error?: string }> {
    if (!this.drive) {
      return { success: false, error: 'Google Drive not configured' };
    }

    try {
      const response = await this.drive.files.list({
        q: `'${this.folderId}' in parents`,
        fields: 'files(id, name, mimeType, createdTime)',
        orderBy: 'createdTime desc',
      });

      return {
        success: true,
        files: response.data.files || [],
      };
    } catch (error) {
      console.error('Google Drive list files error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  isConfigured(): boolean {
    return !!this.drive;
  }
}

// Export singleton instance
export const googleDriveService = new GoogleDriveService();