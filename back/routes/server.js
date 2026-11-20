const express = require('express');
const router = express.Router();
const { readJSON, writeJSON } = require('../storage');
const { requireAdmin } = require('../middleware/auth');

// GET /api/server/status - Public: Server status, IP, online players, praise text
router.get('/status', (req, res) => {
  try {
    const info = readJSON('serverinfo.json', {
      serverName: 'FrokaMC.uz',
      serverIp: 'play.frokamc.uz',
      port: 25565,
      version: '1.16.5 - 1.21.x',
      onlinePlayers: 142,
      maxPlayers: 500,
      status: 'online',
      telegramDonate: 'https://t.me/FrokaMC',
      telegramChannel: 'https://t.me/FrokaMC',
      slogan: 'O\'zbekistonning eng sara va kuchli Minecraft serveri!'
    });

    res.json({
      success: true,
      data: info
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server ma\'lumotlarini olishda xatolik' });
  }
});

// PUT /api/server/status - Admin: Update server status or praise text
router.put('/status', requireAdmin, (req, res) => {
  try {
    const updates = req.body;
    const current = readJSON('serverinfo.json', {});
    const updated = { ...current, ...updates };

    writeJSON('serverinfo.json', updated);
    res.json({
      success: true,
      message: 'Server ma\'lumotlari muvaffaqiyatli yangilandi!',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server ma\'lumotlarini yangilashda xatolik' });
  }
});

module.exports = router;
