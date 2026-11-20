const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { readJSON, writeJSON } = require('../storage');
const { requireAdmin } = require('../middleware/auth');

// GET /api/punishments - Public: List punishments
router.get('/', (req, res) => {
  try {
    const punishments = readJSON('punishments.json', []);
    const { type, search, status } = req.query;

    let filtered = [...punishments];

    if (type && type !== 'ALL') {
      filtered = filtered.filter(p => p.type.toUpperCase() === type.toUpperCase());
    }

    if (status) {
      if (status === 'active') {
        filtered = filtered.filter(p => p.active !== false);
      } else if (status === 'expired') {
        filtered = filtered.filter(p => p.active === false);
      }
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(p => 
        (p.playerNick && p.playerNick.toLowerCase().includes(q)) ||
        (p.reason && p.reason.toLowerCase().includes(q)) ||
        (p.operator && p.operator.toLowerCase().includes(q))
      );
    }

    // Sort by latest created date first
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      count: filtered.length,
      punishments: filtered
    });
  } catch (err) {
    console.error('Get punishments error:', err);
    res.status(500).json({ success: false, message: 'Jazolar ro\'yxatini yuklashda xatolik' });
  }
});

// POST /api/punishments - Admin: Add punishment
router.post('/', requireAdmin, (req, res) => {
  try {
    const { playerNick, type, reason, duration, operator } = req.body;

    if (!playerNick || !playerNick.trim()) {
      return res.status(400).json({ success: false, message: 'O\'yinchi niki kiritilishi shart!' });
    }

    const validTypes = ['BAN', 'MUTE', 'KICK', 'JAIL', 'WARN'];
    const pType = (type && type.toUpperCase()) || 'BAN';
    if (!validTypes.includes(pType)) {
      return res.status(400).json({ success: false, message: 'Noto\'g\'ri jazo turi! (BAN, MUTE, KICK, JAIL, WARN)' });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Jazo sababi kiritilishi shart!' });
    }

    const punishments = readJSON('punishments.json', []);
    const newEntry = {
      id: 'punish_' + crypto.randomUUID().slice(0, 8),
      playerNick: playerNick.trim(),
      type: pType,
      reason: reason.trim(),
      duration: (duration && duration.trim()) || 'Abadiy (Permanent)',
      operator: (operator && operator.trim()) || req.admin.username || 'Admin',
      active: true,
      createdAt: new Date().toISOString()
    };

    punishments.unshift(newEntry);
    writeJSON('punishments.json', punishments);

    res.json({
      success: true,
      message: `${playerNick.trim()} o'yinchisiga nisbatan ${pType} jazosi muvaffaqiyatli belgilandi!`,
      entry: newEntry
    });
  } catch (err) {
    console.error('Add punishment error:', err);
    res.status(500).json({ success: false, message: 'Jazo qo\'shishda xatolik yuz berdi' });
  }
});

// PUT /api/punishments/:id - Admin: Edit / Toggle active (Unban/Unmute)
router.put('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { playerNick, type, reason, duration, active } = req.body;

    const punishments = readJSON('punishments.json', []);
    const index = punishments.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Jazo yozuvi topilmadi!' });
    }

    const item = punishments[index];
    if (playerNick) item.playerNick = playerNick.trim();
    if (type) item.type = type.toUpperCase();
    if (reason) item.reason = reason.trim();
    if (duration) item.duration = duration.trim();
    if (active !== undefined) item.active = Boolean(active);
    item.updatedAt = new Date().toISOString();
    item.updatedBy = req.admin.username;

    punishments[index] = item;
    writeJSON('punishments.json', punishments);

    res.json({
      success: true,
      message: 'Jazo ma\'lumotlari muvaffaqiyatli yangilandi!',
      entry: item
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Jazoni tahrirlashda xatolik yuz berdi' });
  }
});

// DELETE /api/punishments/:id - Admin: Delete punishment entry
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const punishments = readJSON('punishments.json', []);
    const filtered = punishments.filter(p => p.id !== id);

    if (filtered.length === punishments.length) {
      return res.status(404).json({ success: false, message: 'O\'chirmoqchi bo\'lgan jazo yozuvi topilmadi!' });
    }

    writeJSON('punishments.json', filtered);
    res.json({
      success: true,
      message: 'Jazo yozuvi butunlay o\'chirildi!'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'O\'chirishda xatolik yuz berdi' });
  }
});

module.exports = router;
