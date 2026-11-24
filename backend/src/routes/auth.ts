import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/store.js';
import { JWT_SECRET, AuthenticatedRequest, authenticateJWT } from '../middleware/auth.js';
import { User, UserRole, StudentProfile, FacultyProfile } from '../types/index.js';
import { emailService } from '../services/emailService.js';

const router = Router();

// In-memory hashed password reset store { hashedToken: { userId, expiresAt } }
const resetTokens = new Map<string, { userId: string; expiresAt: number }>();

// POST /api/auth/login - Role-verified login with role, username & password
router.post('/login', async (req: Request, res: Response) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = db.data.users.find(
    u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()
  );

  if (!user || !user.is_active) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  if (role && user.role !== role) {
    return res.status(403).json({
      error: `Access Denied: Account '${username}' belongs to role '${user.role.toUpperCase()}', not '${role.toUpperCase()}'. Please select the matching role.`
    });
  }

  const match = bcrypt.compareSync(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // Generate JWT (default 8 hours session timeout)
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  // Retrieve role-specific profile details
  let profileData: any = null;
  if (user.role === 'student') {
    profileData = db.data.studentProfiles.find(s => s.user_id === user.id);
  } else if (user.role === 'faculty' || user.role === 'class_incharge') {
    profileData = db.data.facultyProfiles.find(f => f.user_id === user.id);
  }

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      fullName: user.full_name,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      profile: profileData
    },
    sessionTimeoutSeconds: 3600 * 2 // 2 hours configurable inactivity
  });
});

// POST /api/auth/register - Role-specific account registration
router.post('/register', async (req: Request, res: Response) => {
  const {
    role,
    email,
    username,
    password,
    fullName,
    phone,
    // Student specifics
    rollNumber,
    admissionNumber,
    departmentId,
    classId,
    currentYear,
    semester,
    // Faculty specifics
    employeeId,
    designation,
    qualification,
    specialization
  } = req.body;

  if (!role || !email || !username || !password || !fullName) {
    return res.status(400).json({ error: 'All core registration fields are required' });
  }

  const existing = db.data.users.find(
    u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase()
  );

  if (existing) {
    return res.status(409).json({ error: 'User with this email or username already exists' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = uuidv4();

  const newUser: User = {
    id: userId,
    email,
    username,
    password_hash: hashedPassword,
    role: role as UserRole,
    full_name: fullName,
    phone,
    avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.data.users.unshift(newUser);

  if (role === 'student') {
    const studentProfile: StudentProfile = {
      user_id: userId,
      roll_number: rollNumber || `21CSE${Math.floor(100 + Math.random() * 899)}`,
      admission_number: admissionNumber || `ADM-${Date.now().toString().slice(-6)}`,
      department_id: departmentId || 'dept-cse',
      class_id: classId || 'cls-cse-3a',
      current_year: Number(currentYear) || 3,
      semester: Number(semester) || 5,
      cgpa: 8.0
    };
    db.data.studentProfiles.unshift(studentProfile);
  } else if (role === 'faculty' || role === 'class_incharge') {
    const facultyProfile: FacultyProfile = {
      user_id: userId,
      employee_id: employeeId || `EMP-CSE-${Math.floor(100 + Math.random() * 899)}`,
      department_id: departmentId || 'dept-cse',
      designation: designation || 'Assistant Professor',
      qualification: qualification || 'M.Tech, Ph.D.',
      specialization
    };
    db.data.facultyProfiles.unshift(facultyProfile);
  }

  db.save();

  const token = jwt.sign(
    { id: newUser.id, username: newUser.username, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  return res.status(201).json({
    message: 'Account registered successfully',
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
      fullName: newUser.full_name
    }
  });
});

// POST /api/auth/forgot-password - Dispatches real password reset email with secure token
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const user = db.data.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

  // Security requirement: Never reveal whether an email exists through public error messages
  if (!user || !user.is_active) {
    return res.json({
      message: 'If this email is registered in CAMPUS-AI, an official password reset link has been dispatched to your inbox.'
    });
  }

  // Generate a cryptographically secure random token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  // Store hashed token with 30-minute validity
  resetTokens.set(hashedToken, {
    userId: user.id,
    expiresAt: Date.now() + 30 * 60 * 1000 // 30 minutes
  });

  // Dispatch real email via Nodemailer
  const delivery = await emailService.sendPasswordResetEmail({
    to: user.email,
    userName: user.full_name,
    resetToken: rawToken,
    expiresInMinutes: 30
  });

  return res.json({
    message: 'If this email is registered in CAMPUS-AI, an official password reset link has been dispatched to your inbox.',
    delivery: {
      success: delivery.success,
      deliveredTo: user.email,
      transportMode: delivery.transportMode,
      previewUrl: delivery.previewUrl || undefined,
      resetUrl: `${(process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, '')}/reset-password?token=${rawToken}`
    }
  });
});

// POST /api/auth/reset-password - Updates password using validated token
router.post('/reset-password', (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Reset token and new password are required.' });
  }

  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters in length.' });
  }

  const hashedToken = crypto.createHash('sha256').update(String(token).trim()).digest('hex');
  const record = resetTokens.get(hashedToken);

  if (!record || record.expiresAt < Date.now()) {
    return res.status(400).json({ error: 'Reset link is invalid, expired, or has already been used. Please request a new link.' });
  }

  const user = db.data.users.find(u => u.id === record.userId);
  if (!user) {
    return res.status(404).json({ error: 'Associated user account was not found.' });
  }

  // Update password hash securely in the database
  user.password_hash = bcrypt.hashSync(newPassword, 10);
  user.updated_at = new Date().toISOString();

  // Invalidate token immediately to prevent reuse
  resetTokens.delete(hashedToken);
  db.save();

  return res.json({ message: 'Password has been successfully updated. You can now login with your new credentials.' });
});

// GET /api/auth/me - Verify current session
router.get('/me', authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let profileData: any = null;
  if (user.role === 'student') {
    profileData = db.data.studentProfiles.find(s => s.user_id === user.id);
  } else if (user.role === 'faculty' || user.role === 'class_incharge') {
    profileData = db.data.facultyProfiles.find(f => f.user_id === user.id);
  }

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      fullName: user.full_name,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      profile: profileData
    }
  });
});

export default router;
