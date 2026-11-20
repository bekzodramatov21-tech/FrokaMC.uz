const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tierlist', require('./routes/tierlist'));
app.use('/api/punishments', require('./routes/punishments'));
app.use('/api/ranks', require('./routes/ranks'));
app.use('/api/server', require('./routes/server'));
app.use('/api/admin', require('./routes/admin'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    server: 'FrokaMC Backend API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static files
// Vercel: __dirname is back/, so front is at ../front (local) or project root /front (Vercel)
const frontPath = process.env.VERCEL
  ? path.join(process.cwd(), 'front')
  : path.join(__dirname, '..', 'front');

app.use(express.static(frontPath));

// For SPA routing, redirect unknown non-api requests to index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API Endpoint topilmadi' });
  }
  res.sendFile(path.join(frontPath, 'index.html'));
});

// Start Server (local only - Vercel uses serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('========================================================');
    console.log(`🚀 FrokaMC.uz Server muvaffaqiyatli ishga tushdi!`);
    console.log(`🌐 Port: ${PORT}`);
    console.log(`🔗 Local URL: http://localhost:${PORT}`);
    console.log(`🛡️ Admin panel: http://localhost:${PORT}/admin.html`);
    console.log(`✨ Default Adminlar: (admin / admin123), (moderator / moder123)`);
    console.log('========================================================');
  });
}

module.exports = app;
