import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    name?: string;
    picture?: string;
  };
}

export type AuthenticatedRequest = AuthRequest;

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Bearer token' });
  }

  const token = authHeader.split('Bearer ')[1];

  // Handle local demo session tokens
  if (token === 'demo-token' || token.startsWith('demo-')) {
    req.user = {
      uid: req.body?.uid || 'demo-analyst-1',
      email: 'analyst@trendai.internal',
      name: 'Research Analyst (Demo)',
    };
    return next();
  }

  if (!adminAuth) {
    // If Firebase Admin Auth is not configured, fall back to guest session
    req.user = {
      uid: req.body?.uid || 'local-creator',
      email: 'creator@trendai.internal',
      name: 'Local Creator',
    };
    return next();
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
    };
    next();
  } catch (error) {
    console.error('Failed to verify Firebase Auth ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid authentication token' });
  }
}

export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split('Bearer ')[1];

  if (token === 'demo-token' || token.startsWith('demo-')) {
    req.user = {
      uid: 'demo-analyst-1',
      email: 'analyst@trendai.internal',
      name: 'Research Analyst (Demo)',
    };
    return next();
  }

  if (adminAuth) {
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture,
      };
    } catch (error) {
      // Optional auth: continue without user if token is invalid
    }
  }

  next();
}
