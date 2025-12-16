import { Request, Response } from 'express';
import { AuthService } from '../services/authService';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    const { email, password, firstname, lastname } = req.body;
    const result = await AuthService.register({ email, password, firstname, lastname });
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const result = await AuthService.login({ email, password });
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }
  }
}