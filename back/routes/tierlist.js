const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { readJSON, writeJSON } = require('../storage');
const { requireAdmin } = require('../middleware/auth');

// GET /api/tierlist - Public: Get all PvP tierlist entries
router.get('/', (req, res) => {
  try {
    const tierlist = readJSON('tierlist.json', []);
    
    // Sort logic by tier priority: S+, S, A, B, C, D
    const tierOrder = { 'S+': 1, 'S': 2, 'A': 3, 'B': 4, 'C': 5, 'D': 6 };
    const sorted = [...tierlist].sort((a, b) => {
      const orderA = tierOrder[a.tier] || 99;
      const orderB = tierOrder[b.tier] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return (b.elo || b.points || 0) - (a.elo || a.points || 0);
    });

    res.json({
      success: true,
      count: sorted.length,
      tierlist: sorted
    });
  } catch (err) {
    console.error('Get tierlist error:', err);
    res.status(500).json({ success: false, message: 'Tierlist ma\'lumotlarini yuklashda xatolik' });
  }
});

// POST /api/tierlist - Admin: Add player to PvP tierlist
router.post('/', requireAdmin, (req, res) => {
  try {
    const { playerNick, tier, points, kills, deaths, playstyle, notes } = req.body;

    if (!playerNick || !playerNick.trim()) {
      return res.status(400).json({ success: false, message: 'O\'yinchi niki kiritilishi shart!' });
    }

    if (!tier || !['S+', 'S', 'A', 'B', 'C', 'D'].includes(tier.toUpperCase())) {
      return res.status(400).json({ success: false, message: 'Yaroqli Tier tanlang (S+, S, A, B, C, D)!' });
    }

    const cleanNick = playerNick.trim();
    const tierlist = readJSON('tierlist.json', []);

    // Check if player already exists in tierlist
    const existing = tierlist.find(t => t.playerNick.toLowerCase() === cleanNick.toLowerCase());
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: `Bu o'yinchi (${cleanNick}) allaqachon tierlistda mavjud! Yangilash uchun tahrirlashdan foydalaning.` 
      });
    }

    const newEntry = {
      id: 'tier_' + crypto.randomUUID().slice(0, 8),
      playerNick: cleanNick,
      tier: tier.toUpperCase(),
      elo: Number(points) || 1000,
      kills: Number(kills) || 0,
      deaths: Number(deaths) || 0,
      playstyle: (playstyle && playstyle.trim()) || 'Sword & Pot',
      notes: (notes && notes.trim()) || '',
      addedBy: req.admin.username || 'admin',
      updatedAt: new Date().toISOString()
    };

    tierlist.push(newEntry);
    writeJSON('tierlist.json', tierlist);

    res.json({
      success: true,
      message: `${cleanNick} muvaffaqiyatli ${newEntry.tier} tieriga qo'shildi!`,
      entry: newEntry
    });
  } catch (err) {
    console.error('Add tierlist error:', err);
    res.status(500).json({ success: false, message: 'O\'yinchini qo\'shishda xatolik yuz berdi' });
  }
});

// PUT /api/tierlist/:id - Admin: Edit PvP tierlist entry
router.put('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { playerNick, tier, points, kills, deaths, playstyle, notes } = req.body;

    const tierlist = readJSON('tierlist.json', []);
    const index = tierlist.findIndex(t => t.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Tierlist yozuvi topilmadi!' });
    }

    const item = tierlist[index];
    if (playerNick) item.playerNick = playerNick.trim();
    if (tier) item.tier = tier.toUpperCase();
    if (points !== undefined) item.elo = Number(points);
    if (kills !== undefined) item.kills = Number(kills);
    if (deaths !== undefined) item.deaths = Number(deaths);
    if (playstyle !== undefined) item.playstyle = playstyle.trim();
    if (notes !== undefined) item.notes = notes.trim();
    item.updatedAt = new Date().toISOString();
    item.updatedBy = req.admin.username;

    tierlist[index] = item;
    writeJSON('tierlist.json', tierlist);

    res.json({
      success: true,
      message: 'Tierlist ma\'lumotlari muvaffaqiyatli yangilandi!',
      entry: item
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Tierlistni yangilashda xatolik yuz berdi' });
  }
});

// DELETE /api/tierlist/:id - Admin: Delete tierlist entry
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const tierlist = readJSON('tierlist.json', []);
    const filtered = tierlist.filter(t => t.id !== id);

    if (filtered.length === tierlist.length) {
      return res.status(404).json({ success: false, message: 'O\'chirmoqchi bo\'lgan yozuv topilmadi!' });
    }

    writeJSON('tierlist.json', filtered);
    res.json({
      success: true,
      message: 'O\'yinchi tierlistdan muvaffaqiyatli o\'chirildi!'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'O\'chirishda xatolik yuz berdi' });
  }
});

module.exports = router;
