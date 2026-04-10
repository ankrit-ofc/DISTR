import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import {
  hashPassword,
  verifyPassword,
  generateOTP,
  createSession,
  deleteSession,
} from '../lib/auth';
// [SMS - UNCOMMENT WHEN SPARROW ACCOUNT READY]
// import { sendSMS, otpMessage } from '../lib/sms';
// [/SMS]
import { sendEmail, render } from '../lib/email';
import { WelcomeEmail } from '../emails/WelcomeEmail';
import { OtpEmail } from '../emails/OtpEmail';
import { requireAuth } from '../middleware/auth';
import { authLimiter, otpLimiter } from '../middleware/rateLimiter';

const router = Router();

// ─── POST /api/auth/request-otp ──────────────────────────────────────────────
// Find or create a PENDING profile by email, generate OTP, send via email.
router.post('/request-otp', otpLimiter, async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as { email?: string };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Valid email address required' });
    return;
  }

  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  let profile = await prisma.profile.findUnique({ where: { email } });

  if (!profile) {
    // Create PENDING profile with temporary unique phone placeholder
    const tempPhone = `PENDING_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    profile = await prisma.profile.create({
      data: { email, phone: tempPhone, passwordHash: '', otpCode: otp, otpExpiry, status: 'PENDING' },
    });
  } else {
    await prisma.profile.update({
      where: { email },
      data: { otpCode: otp, otpExpiry },
    });
  }

  // Send OTP via email
  void (async () => {
    try {
      const html = await render(OtpEmail({ otp, email }));
      await sendEmail(email, 'Your DISTRO verification code', html, 'otp');
    } catch (e) {
      console.error('[EMAIL] OTP pipeline failed:', e);
    }
  })();

  // [SMS - UNCOMMENT WHEN SPARROW ACCOUNT READY]
  // void sendSMS(phone, otpMessage(otp));
  // [/SMS]

  res.json({ message: 'OTP sent' });
});

// ─── POST /api/auth/verify-otp ───────────────────────────────────────────────
// Validate OTP code + expiry, mark emailVerified + phoneVerified, clear OTP fields.
router.post('/verify-otp', authLimiter, async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body as { email?: string; otp?: string };
  if (!email || !otp) {
    res.status(400).json({ error: 'email and otp are required' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { email } });
  if (!profile || !profile.otpCode || !profile.otpExpiry) {
    res.status(400).json({ error: 'No OTP requested for this email' });
    return;
  }
  if (profile.otpExpiry < new Date()) {
    res.status(400).json({ error: 'OTP has expired' });
    return;
  }
  if (profile.otpCode !== otp) {
    res.status(400).json({ error: 'Invalid OTP' });
    return;
  }

  await prisma.profile.update({
    where: { email },
    data: { phoneVerified: true, emailVerified: true, otpCode: null, otpExpiry: null },
  });

  res.json({ message: 'Email verified' });
});

// ─── POST /api/auth/register ─────────────────────────────────────────────────
// Requires prior OTP verification. Email is primary identifier; phone is additional info.
router.post('/register', authLimiter, async (req: Request, res: Response): Promise<void> => {
  const { email, password, storeName, ownerName, district, phone, address } =
    req.body as {
      email?: string;
      password?: string;
      storeName?: string;
      ownerName?: string;
      district?: string;
      phone?: string;
      address?: string;
    };

  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }
  if (!phone) {
    res.status(400).json({ error: 'phone is required' });
    return;
  }

  const profile = await prisma.profile.findUnique({ where: { email } });
  if (!profile) {
    res.status(400).json({ error: 'Email not found — request OTP first' });
    return;
  }
  if (!profile.phoneVerified) {
    res.status(400).json({ error: 'Email not verified — complete OTP verification first' });
    return;
  }
  if (profile.status === 'ACTIVE') {
    res.status(409).json({ error: 'Account already registered' });
    return;
  }

  // Validate phone uniqueness (another profile already owns this real phone)
  const phoneTaken = await prisma.profile.findFirst({
    where: { phone, id: { not: profile.id } },
  });
  if (phoneTaken) {
    res.status(409).json({ error: 'Phone number already in use' });
    return;
  }

  const passwordHash = await hashPassword(password);

  const updated = await prisma.profile.update({
    where: { email },
    data: {
      passwordHash,
      phone,
      status: 'ACTIVE',
      storeName,
      ownerName,
      district,
      address,
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const token = await createSession(updated.id);

  // Non-blocking welcome email
  void (async () => {
    try {
      const html = await render(WelcomeEmail({
        storeName: updated.storeName ?? updated.phone,
        phone: updated.phone,
      }));
      await sendEmail(updated.email!, 'Welcome to DISTRO', html, 'welcome');
    } catch (e) {
      console.error('[EMAIL] Welcome pipeline failed:', e);
    }
  })();

  const { passwordHash: _, otpCode, otpExpiry, ...safeProfile } = updated;
  res.status(201).json({ token, profile: safeProfile });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
// Accept { email, password } — email can be email address OR phone (backwards compat).
// Finds profile where email = input OR phone = input.
router.post('/login', authLimiter, async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }

  // Support both email and phone login (backwards compat)
  const profile = await prisma.profile.findFirst({
    where: { OR: [{ email }, { phone: email }] },
  });

  if (!profile || profile.status === 'PENDING') {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  if (profile.status === 'SUSPENDED') {
    res.status(403).json({ error: 'Account suspended' });
    return;
  }

  // Lockout check
  if (profile.lockedUntil && profile.lockedUntil > new Date()) {
    const remaining = Math.ceil((profile.lockedUntil.getTime() - Date.now()) / 1000);
    res.status(429).json({ error: 'Account locked', lockedUntil: profile.lockedUntil, remaining });
    return;
  }

  const valid = await verifyPassword(password, profile.passwordHash);
  if (!valid) {
    const attempts = profile.loginAttempts + 1;
    const lockData =
      attempts >= 5
        ? { loginAttempts: attempts, lockedUntil: new Date(Date.now() + 15 * 60 * 1000) }
        : { loginAttempts: attempts };

    await prisma.profile.update({ where: { id: profile.id }, data: lockData });

    if (attempts >= 5) {
      res.status(429).json({ error: 'Too many failed attempts. Account locked for 15 minutes.' });
    } else {
      res.status(401).json({ error: 'Invalid credentials', attemptsRemaining: 5 - attempts });
    }
    return;
  }

  // Success — reset lockout counters
  await prisma.profile.update({
    where: { id: profile.id },
    data: { loginAttempts: 0, lockedUntil: null },
  });

  const token = await createSession(profile.id);
  const { passwordHash, otpCode, otpExpiry, ...safeProfile } = profile;
  res.json({ token, profile: safeProfile });
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const token = (req as any).token as string;
  await deleteSession(token);
  res.json({ message: 'Logged out' });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', requireAuth, (req: Request, res: Response): void => {
  const profile = (req as any).profile;
  const { passwordHash, otpCode, otpExpiry, ...safeProfile } = profile;
  res.json(safeProfile);
});

export default router;
