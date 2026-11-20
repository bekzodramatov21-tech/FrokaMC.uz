const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'frokamc_ultra_secret_key_2026_minecraft_super';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Middleware to authenticate any valid token (user or admin)
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Avtorizatsiya talab qilinadi!' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Token yaroqsiz yoki muddati o\'tgan!' });
  }

  req.user = decoded;
  next();
}

// Middleware to require admin / moderator privileges
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Admin avtorizatsiyasi talab qilinadi!' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded || (decoded.type !== 'admin' && decoded.role !== 'superadmin' && decoded.role !== 'moderator')) {
    return res.status(403).json({ success: false, message: 'Ruxsat berilmadi! Faqat adminlar uchun.' });
  }

  req.admin = decoded;
  next();
}

module.exports = {
  generateToken,
  verifyToken,
  requireAuth,
  requireAdmin
};
