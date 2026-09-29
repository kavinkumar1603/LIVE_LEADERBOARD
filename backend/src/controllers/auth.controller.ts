import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';

export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Please provide email and password' });
        return;
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
        return;
      }

      const secret = process.env.JWT_SECRET || 'super_secret_live_coding_assessment_key_2026_!@#';
      const token = jwt.sign(
        { id: user._id, role: user.role, email: user.email },
        secret,
        { expiresIn: '7d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentId: user.studentId,
          department: user.department,
          section: user.section,
          year: user.year
        }
      });
    } catch (error: any) {
      console.error('[AuthController.login] Error:', error);
      res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
    }
  }

  static async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  }

  static async me(req: AuthRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        studentId: req.user.studentId,
        department: req.user.department,
        section: req.user.section,
        year: req.user.year
      }
    });
  }

  static async getDemoAccounts(_req: Request, res: Response): Promise<void> {
    try {
      const users = await User.find({}).select('email name role studentId department section');
      res.status(200).json({
        success: true,
        accounts: users
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
