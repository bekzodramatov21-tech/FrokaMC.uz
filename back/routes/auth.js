const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { readJSON, writeJSON, hashPassword, verifyPassword } = require('../storage');
const { generateToken, requireAuth } = require('../middleware/auth');

// POST /api/auth/login-or-register
// Player enters Minecraft Nickname and sets/enters password
router.post('/login-or-register', (req, res) => {
  try {
    const { nickname, password } = req.body;

    if (!nickname || !nickname.trim()) {
      return res.status(400).json({ success: false, message: 'Minecraft nikingizni kiriting!' });
    }

    if (!password || password.length < 4) {
      return res.status(400).json({ success: false, message: 'Parol kamida 4 ta belgidan iborat bo\'lishi kerak!' });
    }

    const cleanNick = nickname.trim();
    // Minecraft nickname validation (letters, numbers, underscores, 3-16 chars)
    const nickRegex = /^[a-zA-Z0-9_]{3,16}$/;
    if (!nickRegex.test(cleanNick)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Minecraft niki faqat lotin harflari, raqamlar va pastki chiziqdan (3-16 belgi) iborat bo\'lishi shart!' 
      });
    }

    const users = readJSON('users.json', []);
    const existingUserIndex = users.findIndex(
      u => u.nickname.toLowerCase() === cleanNick.toLowerCase()
    );

    if (existingUserIndex !== -1) {
      // User exists -> verify password
      const user = users[existingUserIndex];
      const isValid = verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ 
          success: false, 
          message: 'Bu nik allaqachon ro\'yxatdan o\'tgan, kiritilgan parol noto\'g\'ri!' 
        });
      }

      // Update lastLogin
      user.lastLogin = new Date().toISOString();
      users[existingUserIndex] = user;
      writeJSON('users.json', users);

      const token = generateToken({
        id: user.id,
        nickname: user.nickname,
        type: 'user',
        rank: user.rank || 'O\'yinchi'
      });

      return res.json({
        success: true,
        isNewUser: false,
        message: `Xush kelibsiz, ${user.nickname}!`,
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          rank: user.rank || 'O\'yinchi',
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      });
    } else {
      // User does NOT exist -> create new account with this nickname & password!
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
        isNewUser: true,
        message: `Tabriklaymiz, ${newUser.nickname}! Yangi hisob muvaffaqiyatli yaratildi va tizimga kirdingiz.`,
        token,
        user: {
          id: newUser.id,
          nickname: newUser.nickname,
          rank: newUser.rank,
          createdAt: newUser.createdAt,
          lastLogin: newUser.lastLogin
        }
      });
    }
  } catch (err) {
    console.error('Login/Register error:', err);
    res.status(500).json({ success: false, message: 'Serverda ichki xatolik yuz berdi' });
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
      user: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        email: admin.email || '',
        displayName: admin.displayName || admin.username
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
    user: {
      id: user.id,
      nickname: user.nickname,
      rank: user.rank || 'O\'yinchi',
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }
  });
});

// POST /api/auth/admin-login
router.post('/admin-login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Login va parolni kiriting!' });
    }

    const admins = readJSON('admins.json', []);
    const admin = admins.find(a => a.username.toLowerCase() === username.trim().toLowerCase());

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Admin login yoki parol noto\'g\'ri!' });
    }

    const isValid = verifyPassword(password, admin.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Admin login yoki parol noto\'g\'ri!' });
    }

    const token = generateToken({
      id: admin.id,
      username: admin.username,
      role: admin.role,
      type: 'admin'
    });

    res.json({
      success: true,
      message: `Xush kelibsiz, Admin ${admin.displayName || admin.username}!`,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        email: admin.email || '',
        displayName: admin.displayName || admin.username
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ success: false, message: 'Serverda xatolik yuz berdi' });
  }
});

module.exports = router;
