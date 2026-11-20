const express = require('express');
const router = express.Router();
const { readJSON, writeJSON } = require('../storage');
const { requireAdmin } = require('../middleware/auth');

// GET /api/ranks - Public: List all ranks
router.get('/', (req, res) => {
  try {
    const ranks = readJSON('ranks.json', []);
    res.json({
      success: true,
      count: ranks.length,
      ranks
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Ranklarni yuklashda xatolik' });
  }
});

// GET /api/ranks/:id - Public: Single rank details
router.get('/:id', (req, res) => {
  try {
    const ranks = readJSON('ranks.json', []);
    const rank = ranks.find(r => r.id === req.params.id);
    if (!rank) {
      return res.status(404).json({ success: false, message: 'Rank topilmadi' });
    }
    res.json({ success: true, rank });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

// PUT /api/ranks/:id - Admin: Update rank prices or details
router.put('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { price30, priceForever } = req.body;
    const ranks = readJSON('ranks.json', []);
    const index = ranks.findIndex(r => r.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Rank topilmadi' });
    }

    if (price30 !== undefined) ranks[index].price30 = Number(price30);
    if (priceForever !== undefined) ranks[index].priceForever = Number(priceForever);

    writeJSON('ranks.json', ranks);
    res.json({ success: true, message: 'Rank muvaffaqiyatli yangilandi!', rank: ranks[index] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Xatolik yuz berdi' });
  }
});

module.exports = router;
