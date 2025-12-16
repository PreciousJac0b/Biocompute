import { Request, Response, NextFunction } from 'express';
import { JWTUtils } from "../utils/jwtUtils";

export const authMiddleware = (async (req: Request, res: Response, next: NextFunction): Promise<void>  => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          message: 'Access denied. No token provided.',
        });
        return;
      }

      const token = authHeader.split(' ')[1];
      const decoded = JWTUtils.verifyAccessToken(token);

      if ('error' in decoded) {
        res.status(401).json({
          success: false,
          message: 'Invalid or expired token.',
        });
        return;
      }

      (req as any).user = decoded;

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Authentication error.',
        error,
      });
    }
}
);