const express = require('express');
const router = express.Router();
const { readJSON, writeJSON, hashPassword, verifyPassword } = require('../storage');
const { requireAdmin } = require('../middleware/auth');

// All routes here require admin access
router.use(requireAdmin);

// GET /api/admin/profile - Current admin info
router.get('/profile', (req, res) => {
  try {
    const admins = readJSON('admins.json', []);
    const admin = admins.find(a => a.id === req.admin.id || a.username === req.admin.username);

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin profili topilmadi' });
    }

    res.json({
      success: true,
      profile: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        email: admin.email || '',
        displayName: admin.displayName || admin.username,
        createdAt: admin.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// PUT /api/admin/update-profile - Admin updates Gmail and/or password
router.put('/update-profile', (req, res) => {
  try {
    const { email, currentPassword, newPassword, displayName } = req.body;
    const admins = readJSON('admins.json', []);
    const adminIndex = admins.findIndex(a => a.id === req.admin.id || a.username === req.admin.username);

    if (adminIndex === -1) {
      return res.status(404).json({ success: false, message: 'Admin topilmadi' });
    }

    const admin = admins[adminIndex];

    // If changing password, current password must be checked
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Yangi parol o\'rnatish uchun joriy parolingizni kiriting!' });
      }
      if (!verifyPassword(currentPassword, admin.passwordHash)) {
        return res.status(400).json({ success: false, message: 'Joriy parol noto\'g\'ri!' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak!' });
      }
      admin.passwordHash = hashPassword(newPassword);
    }

    // Update email / Gmail
    if (email !== undefined) {
      const emailTrim = email.trim();
      if (emailTrim && !emailTrim.includes('@')) {
        return res.status(400).json({ success: false, message: 'Email manzili to\'g\'ri formatda emas!' });
      }
      admin.email = emailTrim;
    }

    // Update display name
    if (displayName !== undefined && displayName.trim()) {
      admin.displayName = displayName.trim();
    }

    admin.updatedAt = new Date().toISOString();
    admins[adminIndex] = admin;
    writeJSON('admins.json', admins);

    res.json({
      success: true,
      message: 'Admin ma\'lumotlari muvaffaqiyatli yangilandi!',
      profile: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        email: admin.email,
        displayName: admin.displayName
      }
    });
  } catch (err) {
    console.error('Update admin profile error:', err);
    res.status(500).json({ success: false, message: 'Serverda xatolik yuz berdi' });
  }
});

// GET /api/admin/stats - System statistics
router.get('/stats', (req, res) => {
  try {
    const users = readJSON('users.json', []);
    const tierlist = readJSON('tierlist.json', []);
    const punishments = readJSON('punishments.json', []);
    const ranks = readJSON('ranks.json', []);

    const activeBans = punishments.filter(p => p.active !== false && p.type === 'BAN').length;
    const activeMutes = punishments.filter(p => p.active !== false && p.type === 'MUTE').length;

    res.json({
      success: true,
      stats: {
        totalUsers: users.length,
        tierlistCount: tierlist.length,
        totalPunishments: punishments.length,
        activeBans,
        activeMutes,
        totalRanks: ranks.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// GET /api/admin/users - Registered user accounts list
router.get('/users', (req, res) => {
  try {
    const users = readJSON('users.json', []);
    const sanitized = users.map(u => ({
      id: u.id,
      nickname: u.nickname,
      rank: u.rank || 'O\'yinchi',
      createdAt: u.createdAt,
      lastLogin: u.lastLogin
    }));

    res.json({
      success: true,
      users: sanitized
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

module.exports = router;
