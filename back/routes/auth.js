const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { readJSON, writeJSON, hashPassword, verifyPassword } = require('../storage');
const { generateToken, requireAuth } = require('../middleware/auth');

// POST /api/auth/login
// Unified login: checks admins.json (admin, moderator) FIRST, then users.json (players)
router.post('/login', (req, res) => {
  try {
    const rawUser = req.body.username || req.body.nickname || '';
    const password = req.body.password || '';

    if (!rawUser || !rawUser.trim()) {
      return res.status(400).json({ success: false, message: 'Login yoki Minecraft nikingizni kiriting!' });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: 'Parolingizni kiriting!' });
    }

    const cleanUser = rawUser.trim();

    // 1. Check in admins.json (admin, moderator)
    const admins = readJSON('admins.json', []);
    const admin = admins.find(a => a.username.toLowerCase() === cleanUser.toLowerCase());

    if (admin) {
      const isValid = verifyPassword(password, admin.passwordHash);
      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Admin / Moderator paroli noto\'g\'ri!' });
      }

      const token = generateToken({
        id: admin.id,
        username: admin.username,
        role: admin.role,
        type: 'admin'
      });

      return res.json({
        success: true,
        type: 'admin',
        role: admin.role, // 'superadmin' or 'moderator'
        message: `Xush kelibsiz, ${admin.displayName || admin.username}!`,
        token,
        user: {
          id: admin.id,
          username: admin.username,
          nickname: admin.username,
          displayName: admin.displayName || admin.username,
          role: admin.role,
          email: admin.email || '',
          type: 'admin'
        }
      });
    }

    // 2. Check in users.json (regular Minecraft players)
    const users = readJSON('users.json', []);
    const userIndex = users.findIndex(u => u.nickname.toLowerCase() === cleanUser.toLowerCase());

    if (userIndex !== -1) {
      const user = users[userIndex];
      const isValid = verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Minecraft niki uchun kiritilgan parol noto\'g\'ri!' });
      }

      user.lastLogin = new Date().toISOString();
      users[userIndex] = user;
      writeJSON('users.json', users);

      const token = generateToken({
        id: user.id,
        nickname: user.nickname,
        type: 'user',
        rank: user.rank || 'O\'yinchi'
      });

      return res.json({
        success: true,
        type: 'user',
        role: 'player',
        message: `Xush kelibsiz, ${user.nickname}!`,
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          rank: user.rank || 'O\'yinchi',
          type: 'user',
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      });
    }

    // 3. User not found
    return res.status(404).json({
      success: false,
      message: 'Foydalanuvchi topilmadi. Agar birinchi marta kirayotgan bo\'lsangiz, "Ro\'yxatdan o\'tish" (Create Account) orqali yangi hisob oching!'
    });
  } catch (err) {
    console.error('Unified login error:', err);
    res.status(500).json({ success: false, message: 'Serverda ichki xatolik yuz berdi' });
  }
});

// POST /api/auth/register
// Dedicated registration for Minecraft players
router.post('/register', (req, res) => {
  try {
    const { nickname, password } = req.body;

    if (!nickname || !nickname.trim()) {
      return res.status(400).json({ success: false, message: 'Minecraft nikingizni kiriting!' });
    }

    if (!password || password.length < 4) {
      return res.status(400).json({ success: false, message: 'Parol kamida 4 ta belgidan iborat bo\'lishi kerak!' });
    }

    const cleanNick = nickname.trim();
    const nickRegex = /^[a-zA-Z0-9_]{3,16}$/;
    if (!nickRegex.test(cleanNick)) {
      return res.status(400).json({
        success: false,
        message: 'Minecraft niki 3-16 ta lotin harflari, raqamlar va pastki chiziqdan iborat bo\'lishi shart!'
      });
    }

    // Reserved names
    const reserved = ['admin', 'moderator', 'system', 'root', 'staff', 'owner'];
    if (reserved.includes(cleanNick.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Bu nik nomi tizim tomonidan band qilingan!'
      });
    }

    const admins = readJSON('admins.json', []);
    if (admins.some(a => a.username.toLowerCase() === cleanNick.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Bu nom adminlar uchun band qilingan!' });
    }

    const users = readJSON('users.json', []);
    if (users.some(u => u.nickname.toLowerCase() === cleanNick.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Bu Minecraft niki allaqachon ro\'yxatdan o\'tgan! Iltimos, Kirish sahifasidan foydalaning.'
      });
    }

    const newUser = {
      id: 'usr_' + crypto.randomUUID().slice(0, 8),
      nickname: cleanNick,
      passwordHash: hashPassword(password),
      rank: 'O\'yinchi',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    users.push(newUser);
    writeJSON('users.json', users);

    const token = generateToken({
      id: newUser.id,
      nickname: newUser.nickname,
      type: 'user',
      rank: newUser.rank
    });

    return res.json({
      success: true,
      message: `Tabriklaymiz, ${newUser.nickname}! Yangi hisob muvaffaqiyatli yaratildi.`,
      token,
      user: {
        id: newUser.id,
        nickname: newUser.nickname,
        rank: newUser.rank,
        type: 'user',
        createdAt: newUser.createdAt,
        lastLogin: newUser.lastLogin
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Serverda xatolik yuz berdi' });
  }
});

// GET /api/auth/me - Verify current user session
router.get('/me', requireAuth, (req, res) => {
  if (req.user.type === 'admin') {
    const admins = readJSON('admins.json', []);
    const admin = admins.find(a => a.id === req.user.id || a.username === req.user.username);
    if (!admin) return res.status(404).json({ success: false, message: 'Admin topilmadi' });
    return res.json({
      success: true,
      isAdmin: true,
      type: 'admin',
      role: admin.role,
      user: {
        id: admin.id,
        username: admin.username,
        nickname: admin.username,
        displayName: admin.displayName || admin.username,
        role: admin.role,
        email: admin.email || '',
        type: 'admin'
      }
    });
  }

  const users = readJSON('users.json', []);
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
  }

  res.json({
    success: true,
    isAdmin: false,
    type: 'user',
    user: {
      id: user.id,
      nickname: user.nickname,
      rank: user.rank || 'O\'yinchi',
      type: 'user',
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }
  });
});

// Legacy backward-compatibility routes
router.post('/login-or-register', (req, res) => {
  // Redirect internally to /login or /register
  const cleanNick = (req.body.nickname || '').trim();
  const users = readJSON('users.json', []);
  const exists = users.some(u => u.nickname.toLowerCase() === cleanNick.toLowerCase());
  if (exists) {
    req.body.username = cleanNick;
    return router.handle(req, res);
  }
});

router.post('/admin-login', (req, res) => {
  // Delegates to /login
  req.url = '/login';
  return router.handle(req, res);
});

module.exports = router;
