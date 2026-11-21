// API Configuration for FrokaMC.uz
const CONFIG = {
  // If running on backend origin, use relative /api, else fallback to localhost:5000
  API_BASE_URL: (window.location.protocol.startsWith('http') && window.location.port === '5000') 
    ? '/api' 
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:5000/api' 
        : '/api'),
  SERVER_IP: 'play.frokamc.uz',
  TELEGRAM_DONATE: 'https://t.me/FrokaMC',
  TELEGRAM_CHANNEL: 'https://t.me/FrokaMC',
  DISCORD_URL: 'https://discord.gg/frokamc'
};

// Skin Avatar Helper via mc-heads or minotar
function getSkinAvatarUrl(nickname, size = 64) {
  if (!nickname || !nickname.trim()) {
    return 'https://mc-heads.net/avatar/steve/' + size;
  }
  return `https://mc-heads.net/avatar/${encodeURIComponent(nickname.trim())}/${size}`;
}

// Toast Notification Manager
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '❌';

  toast.innerHTML = `<span>${icon}</span><div class="flex-1">${message}</div>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease-in';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
