import type { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../lib/env.js';
import { UnauthorizedError } from './errors.js';

interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: { sub: string; email: string };
    }
  }
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): ReturnType<RequestHandler> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or malformed authorization header'));
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = { sub: decoded.sub, email: decoded.email };
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}
