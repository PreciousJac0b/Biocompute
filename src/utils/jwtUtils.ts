import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

interface JWTPayload {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}


export class JWTUtils {
  private static readonly TOKEN_SECRET: string = process.env.JWT_SECRET!;
  private static ensureTokenSecret(): void {
    if (!JWTUtils.TOKEN_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
  }
  static generateToken(payload: JWTPayload): string {
    this.ensureTokenSecret();
    const token = jwt.sign(payload, this.TOKEN_SECRET, { expiresIn: '24h' });
    return token;
  }

  static verifyAccessToken(token: string): JWTPayload | { error: string } {
    try {
      this.ensureTokenSecret();
      const decoded = jwt.verify(token, this.TOKEN_SECRET!) as JWTPayload;
      if (!decoded) {
        return { error: "Invalid access token" };
      }
      return decoded;
    } catch (error) {
      return { error: "Invalid access token" };
    }
  }
}