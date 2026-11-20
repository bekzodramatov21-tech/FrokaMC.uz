const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, 'data');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Password hashing helper (salt + sha512 for zero-dependency security & high speed)
function hashPassword(password, salt = null) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, originalHash] = storedHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

// Safe Read / Write JSON
function readJSON(filename, defaultValue = []) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) {
      writeJSON(filename, defaultValue);
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return defaultValue;
  }
}

function writeJSON(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  const tempPath = `${filePath}.tmp`;
  try {
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
    return false;
  }
}

// Initialize admins if not present
function initializeAdmins() {
  const admins = readJSON('admins.json', []);
  if (!admins || admins.length === 0) {
    const defaultAdmins = [
      {
        id: 'admin_1',
        username: 'admin',
        passwordHash: hashPassword('admin123'),
        role: 'superadmin',
        email: '',
        displayName: 'Bosh Admin',
        createdAt: new Date().toISOString()
      },
      {
        id: 'admin_2',
        username: 'moderator',
        passwordHash: hashPassword('moder123'),
        role: 'moderator',
        email: '',
        displayName: 'Katta Moderator',
        createdAt: new Date().toISOString()
      }
    ];
    writeJSON('admins.json', defaultAdmins);
    console.log('✅ Default 2 admin hisobi yaratildi: (admin / admin123) va (moderator / moder123)');
  }
}

initializeAdmins();

module.exports = {
  readJSON,
  writeJSON,
  hashPassword,
  verifyPassword
};
