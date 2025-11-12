import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env';

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export interface GoogleUserInfo {
  sub: string; // Google user ID
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

/**
 * Verify Google ID token from mobile clients
 * @param idToken - The ID token from Google Sign-In
 * @returns Decoded user information
 */
export async function verifyGoogleToken(idToken: string): Promise<GoogleUserInfo> {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: [
        env.GOOGLE_CLIENT_ID,
        env.GOOGLE_WEB_CLIENT_ID,
        env.GOOGLE_IOS_CLIENT_ID,
        env.GOOGLE_ANDROID_CLIENT_ID,
      ].filter(Boolean), // Allow tokens from any configured platform client
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error('Invalid token payload');
    }

    if (!payload.email || !payload.email_verified) {
      throw new Error('Email not verified');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      email_verified: payload.email_verified,
      name: payload.name,
      picture: payload.picture,
      given_name: payload.given_name,
      family_name: payload.family_name,
    };
  } catch (error) {
    console.error('Google token verification failed:', error);
    throw new Error('Invalid Google token');
  }
}

/**
 * Exchange authorization code for tokens (for web OAuth flow)
 * @param code - Authorization code from Google OAuth
 * @returns Google user info
 */
export async function exchangeCodeForToken(code: string): Promise<GoogleUserInfo> {
  try {
    const { tokens } = await client.getToken(code);

    if (!tokens.id_token) {
      throw new Error('No ID token received');
    }

    return await verifyGoogleToken(tokens.id_token);
  } catch (error) {
    console.error('Code exchange failed:', error);
    throw new Error('Failed to exchange authorization code');
  }
}
