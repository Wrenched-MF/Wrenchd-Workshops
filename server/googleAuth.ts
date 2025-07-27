import { google } from 'googleapis';

// Your Google Drive credentials from the JSON file
const CREDENTIALS = {
  client_id: "989547637803-u90eo44c0vslj5tu9u4pniih54v1hc31.apps.googleusercontent.com",
  client_secret: "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",
  redirect_uri: "https://replit.com/@lukesapro/Wrenchd-Workshops"
};

export class GoogleAuthService {
  private oauth2Client: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      CREDENTIALS.client_id,
      CREDENTIALS.client_secret,
      CREDENTIALS.redirect_uri
    );
  }

  // Generate the URL for user authorization
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.folder'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  // Exchange authorization code for tokens
  async getTokens(code: string): Promise<{ success: boolean; tokens?: any; error?: string }> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      return { success: true, tokens };
    } catch (error) {
      console.error('Token exchange error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Set tokens for the OAuth client
  setTokens(tokens: any) {
    this.oauth2Client.setCredentials(tokens);
  }

  getAuthClient() {
    return this.oauth2Client;
  }
}

export const googleAuthService = new GoogleAuthService();