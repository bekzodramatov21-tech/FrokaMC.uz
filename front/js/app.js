// FrokaMC.uz Unified Frontend Application Engine
// Handles: Auth (Login/Register), Admin/Moderator Dashboard, and Player Web Portal

let currentUser = null;
let allRanks = [];
let allTierlist = [];
let allPunishments = [];
let allUsers = [];

// Default Demo/Fallback Data in case Backend API is static or offline
const DEFAULT_RANKS = [
  {
    id: 'imperator',
    name: 'IMPERATOR',
    badge: '👑',
    color: '#f59e0b',
    border: 'border-amber-500/80',
    popular: true,
    price30: 49000,
    priceForever: 128000,
    image: 'assets/images/rank-imperator.png',
    commands: [
      { cmd: '/fly', desc: 'Uchish imkoniyati' },
      { cmd: '/near', desc: 'Yaqin atrofdagi o\'yinchilarni ko\'rish' },
      { cmd: '/invsee', desc: 'Boshqa o\'yinchi inventarini tekshirish' },
      { cmd: '/kit imperator', desc: 'Eng kuchli armor va qurollar to\'plami' }
    ],
    features: [
      { name: 'Ender Chest', value: '6 qator (54 slot)' },
      { name: 'Teleport kutish', value: '0 soniya (darhol)' },
      { name: 'Home nuqtalar', value: '20 ta' },
      { name: 'Region chegarasi', value: '15 ta privát' }
    ]
  },
  {
    id: 'general',
    name: 'GENERAL',
    badge: '⚡',
    color: '#06b6d4',
    border: 'border-cyan-500/80',
    popular: false,
    price30: 38000,
    priceForever: 98000,
    image: 'assets/images/rank-general.png',
    commands: [
      { cmd: '/fly', desc: 'Uchish imkoniyati' },
      { cmd: '/heal', desc: 'Jonni to\'liq tiklash' },
      { cmd: '/feed', desc: 'Ochlikni to\'ldirish' },
      { cmd: '/kit general', desc: 'General jang to\'plami' }
    ],
    features: [
      { name: 'Ender Chest', value: '6 qator' },
      { name: 'Teleport kutish', value: '0 soniya' },
      { name: 'Home nuqtalar', value: '18 ta' },
      { name: 'Region chegarasi', value: '15 ta' }
    ]
  },
  {
    id: 'afsona',
    name: 'AFSONA',
    badge: '🌟',
    color: '#a855f7',
    border: 'border-purple-500/80',
    popular: false,
    price30: 29000,
    priceForever: 76000,
    image: 'assets/images/rank-afsona.png',
    commands: [
      { cmd: '/smithtable', desc: 'Mobil temirchilik stoli' },
      { cmd: '/stonecutter', desc: 'Tosh kesgich stoli' },
      { cmd: '/grindstone', desc: 'Sehrni tozalash stoli' },
      { cmd: '/kit afsona', desc: 'Afsonaviy qurollar' }
    ],
    features: [
      { name: 'Ender Chest', value: '5 qator' },
      { name: 'Teleport kutish', value: '3 soniya' },
      { name: 'Home nuqtalar', value: '15 ta' },
      { name: 'Region chegarasi', value: '10 ta' }
    ]
  },
  {
    id: 'elita',
    name: 'ELITA',
    badge: '💎',
    color: '#38bdf8',
    border: 'border-sky-500/80',
    popular: false,
    price30: 21000,
    priceForever: 57000,
    image: 'assets/images/rank-elita.png',
    commands: [
      { cmd: '/jump', desc: 'Qaragan blokga sakrash' },
      { cmd: '/repair', desc: 'Buyumlarni bepul ta\'mirlash' },
      { cmd: '/setwarp', desc: 'Shaxsiy varp yaratish' },
      { cmd: '/kit elita', desc: 'Elita maxsus to\'plam' }
    ],
    features: [
      { name: 'Ender Chest', value: '5 qator' },
      { name: 'AFK kick', value: 'Yo\'q (abadiy AFK)' },
      { name: 'Home nuqtalar', value: '12 ta' },
      { name: 'Region chegarasi', value: '8 ta' }
    ]
  },
  {
    id: 'titan',
    name: 'TITAN',
    badge: '🛡️',
    color: '#10b981',
    border: 'border-emerald-500/80',
    popular: false,
    price30: 15000,
    priceForever: 39000,
    image: 'assets/images/rank-titan.png',
    commands: [
      { cmd: '/workbench', desc: 'Mobil craft stoli' },
      { cmd: '/depth', desc: 'Chuqurlik koordinatasi' },
      { cmd: '/kit titan', desc: 'Titan zirh to\'plami' }
    ],
    features: [
      { name: 'Ender Chest', value: '5 qator' },
      { name: 'Teleport kutish', value: '4 soniya' },
      { name: 'Home nuqtalar', value: '10 ta' },
      { name: 'Region chegarasi', value: '7 ta' }
    ]
  },
  {
    id: 'ritsar',
    name: 'RITSAR',
    badge: '⚔️',
    color: '#ec4899',
    border: 'border-pink-500/80',
    popular: false,
    price30: 10000,
    priceForever: 26000,
    image: 'assets/images/rank-ritsar.png',
    commands: [
      { cmd: '/hat', desc: 'Qo\'ldagi blokni boshga kiyish' },
      { cmd: '/ext', desc: 'Yonayotgan olovni o\'chirish' },
      { cmd: '/kit ritsar', desc: 'Ritsar to\'plami' }
    ],
    features: [
      { name: 'Ender Chest', value: '4 qator' },
      { name: 'O\'limda tajriba', value: 'Yo\'qolmaydi' },
      { name: 'Home nuqtalar', value: '8 ta' },
      { name: 'Region chegarasi', value: '6 ta' }
    ]
  },
  {
    id: 'alpomish',
    name: 'ALPOMISH',
    badge: '🏹',
    color: '#eab308',
    border: 'border-yellow-500/80',
    popular: false,
    price30: 8000,
    priceForever: 19000,
    image: 'assets/images/rank-alpomish.png',
    commands: [
      { cmd: '/time', desc: 'O\'z vaqtini o\'zgartirish' },
      { cmd: '/kit alpomish', desc: 'Alpomish qurollari' }
    ],
    features: [
      { name: 'Ender Chest', value: '4 qator' },
      { name: 'Rangli chat', value: 'Mavjud' },
      { name: 'Home nuqtalar', value: '6 ta' },
      { name: 'Region chegarasi', value: '6 ta' }
    ]
  },
  {
    id: 'qahramon',
    name: 'QAHRAMON',
    badge: '🔥',
    color: '#f97316',
    border: 'border-orange-500/80',
    popular: false,
    price30: 6000,
    priceForever: 14000,
    image: 'assets/images/rank-qahramon.png',
    commands: [
      { cmd: '/clear', desc: 'Keraksiz narsalarni tozalash' },
      { cmd: '/kit qahramon', desc: 'Qahramon to\'plami' }
    ],
    features: [
      { name: 'Ender Chest', value: '4 qator' },
      { name: 'Teleport kutish', value: '6 soniya' },
      { name: 'Home nuqtalar', value: '5 ta' },
      { name: 'Region chegarasi', value: '4 ta' }
    ]
  },
  {
    id: 'askar',
    name: 'ASKAR',
    badge: '🗡️',
    color: '#94a3b8',
    border: 'border-slate-500/80',
    popular: false,
    price30: 4000,
    priceForever: 9000,
    image: 'assets/images/rank-askar.png',
    commands: [
      { cmd: '/top', desc: 'Eng yuqori blokga chiqish' },
      { cmd: '/kit askar', desc: 'Boshlang\'ich askar to\'plami' }
    ],
    features: [
      { name: 'Ender Chest', value: '4 qator' },
      { name: 'Teleport kutish', value: '6 soniya' },
      { name: 'Home nuqtalar', value: '4 ta' },
      { name: 'Region chegarasi', value: '4 ta' }
    ]
  }
];

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

// ----------------------------------------------------
// Core Initialization & Routing
// ----------------------------------------------------
function initApp() {
  initEventListeners();
  loadSession();
  fetchInitialData();
}

function loadSession() {
  const savedToken = localStorage.getItem('frokamc_token');
  const savedUser = localStorage.getItem('frokamc_user');

  if (savedToken && savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      if (currentUser.type === 'admin' || currentUser.isAdmin) {
        switchToAdminView();
      } else {
        switchToPortalView();
      }
      // Re-verify session in background
      verifySession(savedToken);
      return;
    } catch (e) {
      console.warn('Session parse error:', e);
      localStorage.removeItem('frokamc_token');
      localStorage.removeItem('frokamc_user');
    }
  }

  // Not logged in -> Show Auth View (Login)
  switchToAuthView();
}

async function verifySession(token) {
  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success && data.user) {
      currentUser = { ...currentUser, ...data.user, type: data.type || (data.isAdmin ? 'admin' : 'user') };
      localStorage.setItem('frokamc_user', JSON.stringify(currentUser));
      updateUIAfterSessionChange();
    }
  } catch (err) {
    // If backend offline, keep cached session
    console.log('Background session check notice:', err.message);
  }
}

// ----------------------------------------------------
// View Switchers (Auth vs Admin vs Portal)
// ----------------------------------------------------
function switchToAuthView() {
  document.getElementById('auth-view').classList.remove('hidden');
  document.getElementById('admin-view').classList.add('hidden');
  document.getElementById('portal-view').classList.add('hidden');
  switchToLoginView();
  window.location.hash = 'login';
}

function switchToLoginView() {
  document.getElementById('card-login').classList.remove('hidden');
  document.getElementById('card-register').classList.add('hidden');
  window.location.hash = 'login';
}

function switchToRegisterView() {
  document.getElementById('card-login').classList.add('hidden');
  document.getElementById('card-register').classList.remove('hidden');
  window.location.hash = 'register';
}

function switchToAdminView() {
  document.getElementById('auth-view').classList.add('hidden');
  document.getElementById('admin-view').classList.remove('hidden');
  document.getElementById('portal-view').classList.add('hidden');
  renderAdminHeader();
  loadAdminDashboardData();
  window.location.hash = 'admin';
}

function switchToPortalView() {
  document.getElementById('auth-view').classList.add('hidden');
  document.getElementById('admin-view').classList.add('hidden');
  document.getElementById('portal-view').classList.remove('hidden');
  renderPortalHeaderBadge();
  window.location.hash = 'portal';
}

function enterAsGuest() {
  currentUser = null;
  switchToPortalView();
  showToast('Mehmon sifatida saytga kirdingiz. Xarid yoki profil uchun login qiling.', 'info');
}

function userLogout() {
  localStorage.removeItem('frokamc_token');
  localStorage.removeItem('frokamc_user');
  currentUser = null;
  showToast('Tizimdan muvaffaqiyatli chiqdingiz.', 'info');
  switchToAuthView();
}

function updateUIAfterSessionChange() {
  if (currentUser) {
    if (currentUser.type === 'admin' || currentUser.isAdmin) {
      renderAdminHeader();
    }
    renderPortalHeaderBadge();
  }
}

// ----------------------------------------------------
// Auth Handlers (Unified Login & Register)
// ----------------------------------------------------
function fillQuickLogin(username, password) {
  const uInput = document.getElementById('input-login-username');
  const pInput = document.getElementById('input-login-password');
  if (uInput && pInput) {
    uInput.value = username;
    pInput.value = password;
    triggerLoginAvatarPreview(username);
    uInput.focus();
  }
}

function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
}

function triggerLoginAvatarPreview(val) {
  const avatarBox = document.getElementById('login-skin-preview');
  const roleBadge = document.getElementById('login-role-badge');
  const nickStatus = document.getElementById('login-nick-status');
  const clean = (val || '').trim().toLowerCase();

  if (clean === 'admin') {
    avatarBox.src = 'assets/images/logo.jpg';
    avatarBox.className = 'w-16 h-16 rounded-2xl object-cover border-2 border-amber-500 shadow-lg shadow-amber-500/50 mx-auto';
    roleBadge.textContent = '👑';
    nickStatus.textContent = 'Bosh Administrator';
    nickStatus.className = 'text-[10px] text-amber-400 font-bold';
  } else if (clean === 'moderator') {
    avatarBox.src = 'assets/images/logo.jpg';
    avatarBox.className = 'w-16 h-16 rounded-2xl object-cover border-2 border-cyan-500 shadow-lg shadow-cyan-500/50 mx-auto';
    roleBadge.textContent = '🛡️';
    nickStatus.textContent = 'Katta Moderator';
    nickStatus.className = 'text-[10px] text-cyan-400 font-bold';
  } else if (clean.length >= 3) {
    avatarBox.src = getSkinAvatarUrl(clean, 64);
    avatarBox.className = 'w-16 h-16 rounded-2xl skin-head border-2 border-amber-400/80 shadow-lg mx-auto';
    roleBadge.textContent = '🎮';
    nickStatus.textContent = 'Minecraft O\'yinchisi';
    nickStatus.className = 'text-[10px] text-emerald-400 font-semibold';
  } else {
    avatarBox.src = 'assets/images/logo.jpg';
    avatarBox.className = 'w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/80 shadow-lg mx-auto';
    roleBadge.textContent = '🎮';
    nickStatus.textContent = 'O\'yinchi / Admin';
    nickStatus.className = 'text-[10px] text-slate-500';
  }
}

async function handleUnifiedLogin(e) {
  e.preventDefault();
  const username = document.getElementById('input-login-username').value.trim();
  const password = document.getElementById('input-login-password').value;
  const submitBtn = document.getElementById('btn-login-submit');

  if (!username || !password) {
    showToast('Login va parolni to\'liq kiriting!', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span>Tekshirilmoqda...</span>`;

  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span>Tizimga Kirish</span>`;

    if (data.success && data.token) {
      localStorage.setItem('frokamc_token', data.token);
      localStorage.setItem('frokamc_user', JSON.stringify(data.user));
      currentUser = data.user;

      showToast(data.message || 'Xush kelibsiz!', 'success');

      if (data.type === 'admin' || data.user.type === 'admin') {
        switchToAdminView();
      } else {
        switchToPortalView();
      }
      return;
    } else {
      showToast(data.message || 'Kirishda xatolik yuz berdi!', 'error');
      return;
    }
  } catch (err) {
    console.warn('API error, using client-side fallback:', err.message);
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span>Tizimga Kirish</span>`;

    // Resilient Fallback for Static GitHub Pages / Offline Mode
    handleClientSideAuthFallback(username, password);
  }
}

function handleClientSideAuthFallback(username, password) {
  const clean = username.trim().toLowerCase();

  // 1. Admin fallback
  if (clean === 'admin' && (password === 'admin123' || password === 'admin')) {
    currentUser = {
      id: 'admin_1',
      username: 'admin',
      displayName: 'Bosh Admin',
      role: 'superadmin',
      type: 'admin',
      email: ''
    };
    localStorage.setItem('frokamc_token', 'offline_admin_token');
    localStorage.setItem('frokamc_user', JSON.stringify(currentUser));
    showToast('Xush kelibsiz, Bosh Admin!', 'success');
    switchToAdminView();
    return;
  }

  // 2. Moderator fallback
  if (clean === 'moderator' && (password === 'moder123' || password === 'moderator')) {
    currentUser = {
      id: 'admin_2',
      username: 'moderator',
      displayName: 'Katta Moderator',
      role: 'moderator',
      type: 'admin',
      email: ''
    };
    localStorage.setItem('frokamc_token', 'offline_moderator_token');
    localStorage.setItem('frokamc_user', JSON.stringify(currentUser));
    showToast('Xush kelibsiz, Moderator!', 'success');
    switchToAdminView();
    return;
  }

  // 3. Local Registered Players
  const localUsers = JSON.parse(localStorage.getItem('frokamc_local_users') || '[]');
  const match = localUsers.find(u => u.nickname.toLowerCase() === clean);

  if (match) {
    if (match.password === password) {
      currentUser = {
        id: match.id,
        nickname: match.nickname,
        rank: match.rank || 'O\'yinchi',
        type: 'user'
      };
      localStorage.setItem('frokamc_token', 'offline_user_token');
      localStorage.setItem('frokamc_user', JSON.stringify(currentUser));
      showToast(`Xush kelibsiz, ${match.nickname}!`, 'success');
      switchToPortalView();
      return;
    } else {
      showToast('Kiritilgan parol noto\'g\'ri!', 'error');
      return;
    }
  }

  showToast('Foydalanuvchi topilmadi. Agar birinchi marta kirayotgan bo\'lsangiz, Ro\'yxatdan o\'ting (Create Account)!', 'error');
}

async function handleUnifiedRegister(e) {
  e.preventDefault();
  const nickInput = document.getElementById('input-register-nick');
  const passInput = document.getElementById('input-register-password');
  const confirmInput = document.getElementById('input-register-confirm');
  const submitBtn = document.getElementById('btn-register-submit');

  const nickname = nickInput.value.trim();
  const password = passInput.value;
  const confirm = confirmInput.value;

  if (!nickname || !password || !confirm) {
    showToast('Barcha maydonlarni to\'ldiring!', 'error');
    return;
  }

  if (password !== confirm) {
    showToast('Kiritilgan parollar bir-biriga mos kelmadi!', 'error');
    return;
  }

  if (password.length < 4) {
    showToast('Parol kamida 4 ta belgidan iborat bo\'lishi shart!', 'error');
    return;
  }

  const nickRegex = /^[a-zA-Z0-9_]{3,16}$/;
  if (!nickRegex.test(nickname)) {
    showToast('Minecraft niki 3-16 ta harf, raqam va pastki chiziqdan iborat bo\'lishi kerak!', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span>Yaratilmoqda...</span>`;

  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, password })
    });

    const data = await res.json();
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span>Hisob Yaratish & Kirish</span>`;

    if (data.success && data.token) {
      localStorage.setItem('frokamc_token', data.token);
      localStorage.setItem('frokamc_user', JSON.stringify(data.user));
      currentUser = data.user;
      showToast(data.message, 'success');
      switchToPortalView();
      return;
    } else {
      showToast(data.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi!', 'error');
      return;
    }
  } catch (err) {
    console.warn('Register API error, saving locally:', err.message);
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span>Hisob Yaratish & Kirish</span>`;

    // Local client-side registration fallback
    const localUsers = JSON.parse(localStorage.getItem('frokamc_local_users') || '[]');
    if (localUsers.some(u => u.nickname.toLowerCase() === nickname.toLowerCase())) {
      showToast('Bu nik allaqachon ro\'yxatdan o\'tgan! Kirish sahifasidan kiring.', 'error');
      return;
    }

    const newUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      nickname: nickname,
      password: password,
      rank: 'O\'yinchi',
      createdAt: new Date().toISOString()
    };

    localUsers.push(newUser);
    localStorage.setItem('frokamc_local_users', JSON.stringify(localUsers));

    currentUser = {
      id: newUser.id,
      nickname: newUser.nickname,
      rank: newUser.rank,
      type: 'user'
    };
    localStorage.setItem('frokamc_token', 'local_token_' + newUser.id);
    localStorage.setItem('frokamc_user', JSON.stringify(currentUser));

    showToast(`Tabriklaymiz, ${newUser.nickname}! Hisobingiz yaratildi va tizimga kirdingiz.`, 'success');
    switchToPortalView();
  }
}

// ----------------------------------------------------
// Portal Header Badge Renderer
// ----------------------------------------------------
function renderPortalHeaderBadge() {
  const container = document.getElementById('portal-user-badge');
  const adminBtn = document.getElementById('admin-portal-nav-btn');
  if (!container) return;

  if (currentUser) {
    const isStaff = currentUser.type === 'admin' || currentUser.isAdmin;

    if (adminBtn) {
      if (isStaff) adminBtn.classList.remove('hidden');
      else adminBtn.classList.add('hidden');
    }

    container.innerHTML = `
      <div class="flex items-center gap-2.5 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-full shadow-inner">
        <img 
          src="${getSkinAvatarUrl(currentUser.nickname || currentUser.username, 32)}" 
          alt="${currentUser.nickname || currentUser.username}" 
          class="w-7 h-7 rounded-md skin-head border border-amber-500/40"
          onerror="this.src='https://mc-heads.net/avatar/steve/32'"
        />
        <div class="flex flex-col text-left">
          <span class="text-xs font-bold text-white flex items-center gap-1.5">
            ${currentUser.displayName || currentUser.nickname || currentUser.username}
            <span class="text-[10px] px-1.5 py-0.2 ${isStaff ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800 text-slate-300'} rounded font-semibold border">
              ${isStaff ? (currentUser.role === 'superadmin' ? 'Bosh Admin' : 'Moderator') : (currentUser.rank || 'O\'yinchi')}
            </span>
          </span>
        </div>
        <button 
          onclick="userLogout()" 
          title="Chiqish" 
          class="text-xs text-red-400 hover:text-red-300 ml-1 p-1 hover:bg-red-500/10 rounded transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    `;
  } else {
    if (adminBtn) adminBtn.classList.add('hidden');
    container.innerHTML = `
      <button 
        onclick="switchToAuthView()" 
        class="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm transition transform hover:scale-[1.02] shadow-lg shadow-amber-500/20"
      >
        <span>Kirish / Ro'yxatdan o'tish</span>
      </button>
    `;
  }
}

// ----------------------------------------------------
// Admin Dashboard Controller
// ----------------------------------------------------
function renderAdminHeader() {
  if (!currentUser) return;
  const nameEl = document.getElementById('admin-display-name');
  const roleEl = document.getElementById('admin-display-role');
  const indicator = document.getElementById('admin-badge-indicator');
  const profileTabNav = document.getElementById('nav-btn-profile');

  const isSuperadmin = currentUser.role === 'superadmin';

  if (nameEl) nameEl.textContent = currentUser.displayName || currentUser.username;
  if (roleEl) roleEl.textContent = isSuperadmin ? 'Bosh Admin' : 'Moderator';
  if (indicator) indicator.textContent = isSuperadmin ? 'Admin Panel' : 'Moderator Panel';

  // If moderator, hide sensitive superadmin profile tab
  if (profileTabNav) {
    if (isSuperadmin) profileTabNav.classList.remove('hidden');
    else profileTabNav.classList.add('hidden');
  }

  // Pre-fill profile inputs
  const nameInput = document.getElementById('profile-name-input');
  const emailInput = document.getElementById('profile-email-input');
  if (nameInput) nameInput.value = currentUser.displayName || currentUser.username || '';
  if (emailInput) emailInput.value = currentUser.email || '';
}

async function loadAdminDashboardData() {
  await Promise.all([
    fetchServerStatus(),
    loadAdminStats(),
    loadAdminTierlist(),
    loadAdminPunishments(),
    loadAdminUsers()
  ]);
}

async function loadAdminStats() {
  try {
    const token = localStorage.getItem('frokamc_token');
    const res = await fetch(`${CONFIG.API_BASE_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success && data.stats) {
      document.getElementById('stat-total-users').textContent = data.stats.totalUsers || 0;
      document.getElementById('stat-total-tierlist').textContent = data.stats.tierlistCount || 0;
      document.getElementById('stat-total-bans').textContent = data.stats.activeBans || 0;
      document.getElementById('stat-total-mutes').textContent = data.stats.activeMutes || 0;
    }
  } catch (err) {
    // Fallback counts
    document.getElementById('stat-total-users').textContent = (allUsers.length || 2);
    document.getElementById('stat-total-tierlist').textContent = (allTierlist.length || 3);
    document.getElementById('stat-total-bans').textContent = allPunishments.filter(p => p.type === 'BAN').length;
    document.getElementById('stat-total-mutes').textContent = allPunishments.filter(p => p.type === 'MUTE').length;
  }
}

async function loadAdminTierlist() {
  const tbody = document.getElementById('admin-tierlist-tbody');
  if (!tbody) return;

  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/tierlist`);
    const data = await res.json();
    if (data.success) {
      allTierlist = data.tierlist || [];
    }
  } catch (e) {
    if (!allTierlist.length) {
      allTierlist = [
        { id: '1', playerNick: 'AxoPlayer', tier: 'S+', elo: 1850, playstyle: 'Sword Combo', kills: 142, deaths: 18 },
        { id: '2', playerNick: 'UzbekNinja', tier: 'S', elo: 1620, playstyle: 'Crystal PvP', kills: 98, deaths: 24 },
        { id: '3', playerNick: 'Steve_Warrior', tier: 'A', elo: 1390, playstyle: 'Axe & Shield', kills: 65, deaths: 31 }
      ];
    }
  }
  renderAdminTierlist(allTierlist);
}

function renderAdminTierlist(items) {
  const tbody = document.getElementById('admin-tierlist-tbody');
  if (!tbody) return;

  if (!items || !items.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-slate-500">Tierlistda o'yinchilar yo'q.</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(p => `
    <tr class="hover:bg-slate-900/60 transition text-xs">
      <td class="py-3 px-4 flex items-center gap-2">
        <img src="${getSkinAvatarUrl(p.playerNick, 24)}" class="w-6 h-6 rounded skin-head" />
        <span class="font-bold text-white">${p.playerNick}</span>
      </td>
      <td class="py-3 px-4"><span class="px-2 py-0.5 rounded font-black text-amber-400 bg-amber-500/10 border border-amber-500/30">${p.tier}</span></td>
      <td class="py-3 px-4 font-mono font-bold text-cyan-400">${p.elo}</td>
      <td class="py-3 px-4 text-slate-300">${p.playstyle || 'PvP'}</td>
      <td class="py-3 px-4 text-slate-400">${p.kills || 0} / ${p.deaths || 0}</td>
      <td class="py-3 px-4 text-right">
        <button onclick="deleteTierlistPlayer('${p.id}')" class="text-red-400 hover:text-red-300 font-bold p-1">O'chirish</button>
      </td>
    </tr>
  `).join('');
}

async function loadAdminPunishments() {
  const tbody = document.getElementById('admin-punish-tbody');
  if (!tbody) return;

  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/punishments`);
    const data = await res.json();
    if (data.success) {
      allPunishments = data.punishments || [];
    }
  } catch (e) {
    if (!allPunishments.length) {
      allPunishments = [
        { id: 'p1', playerNick: 'CheaterPro', type: 'BAN', reason: 'KillAura cheat', operator: 'Bosh Admin', duration: 'Abadiy', active: true, createdAt: new Date().toISOString() },
        { id: 'p2', playerNick: 'Spammer99', type: 'MUTE', reason: 'Chatda reklama va haqorat', operator: 'Katta Moderator', duration: '24 soat', active: true, createdAt: new Date().toISOString() }
      ];
    }
  }
  renderAdminPunishments(allPunishments);
}

function renderAdminPunishments(items) {
  const tbody = document.getElementById('admin-punish-tbody');
  if (!tbody) return;

  if (!items || !items.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-slate-500">Jazolar mavjud emas.</td></tr>`;
    return;
  }

  tbody.innerHTML = items.map(p => `
    <tr class="hover:bg-slate-900/60 transition text-xs">
      <td class="py-3 px-4 flex items-center gap-2">
        <img src="${getSkinAvatarUrl(p.playerNick, 24)}" class="w-6 h-6 rounded skin-head" />
        <span class="font-bold text-white">${p.playerNick}</span>
      </td>
      <td class="py-3 px-4 font-bold ${p.type === 'BAN' ? 'text-red-400' : 'text-yellow-400'}">${p.type}</td>
      <td class="py-3 px-4 text-slate-300 max-w-xs truncate">${p.reason}</td>
      <td class="py-3 px-4 text-amber-300">${p.operator || 'Admin'}</td>
      <td class="py-3 px-4 text-slate-400">${p.duration}</td>
      <td class="py-3 px-4">${p.active !== false ? '<span class="text-red-400">Faol</span>' : '<span class="text-slate-500">Bekor qilingan</span>'}</td>
      <td class="py-3 px-4 text-right">
        ${p.active !== false ? `<button onclick="unbanPlayer('${p.id}')" class="text-emerald-400 hover:text-emerald-300 font-bold p-1">Unban</button>` : ''}
        <button onclick="deletePunishment('${p.id}')" class="text-red-400 hover:text-red-300 font-bold p-1 ml-2">O'chirish</button>
      </td>
    </tr>
  `).join('');
}

async function loadAdminUsers() {
  const tbody = document.getElementById('admin-users-tbody');
  if (!tbody) return;

  try {
    const token = localStorage.getItem('frokamc_token');
    const res = await fetch(`${CONFIG.API_BASE_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success && data.users) {
      allUsers = data.users;
    }
  } catch (e) {
    const localUsers = JSON.parse(localStorage.getItem('frokamc_local_users') || '[]');
    allUsers = [
      { id: 'usr_1', nickname: 'sherzod_1100', rank: 'O\'yinchi', createdAt: '2026-11-20T15:48:38.946Z', lastLogin: new Date().toISOString() },
      ...localUsers
    ];
  }
  renderAdminUsers(allUsers);
}

function renderAdminUsers(users) {
  const tbody = document.getElementById('admin-users-tbody');
  if (!tbody) return;

  if (!users || !users.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-slate-500">Foydalanuvchilar topilmadi.</td></tr>`;
    return;
  }

  tbody.innerHTML = users.map(u => `
    <tr class="hover:bg-slate-900/60 transition text-xs">
      <td class="py-3 px-4 flex items-center gap-2">
        <img src="${getSkinAvatarUrl(u.nickname, 24)}" class="w-6 h-6 rounded skin-head" />
        <span class="font-bold text-white">${u.nickname}</span>
      </td>
      <td class="py-3 px-4"><span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">${u.rank || 'O\'yinchi'}</span></td>
      <td class="py-3 px-4 text-slate-400">${new Date(u.createdAt).toLocaleDateString('uz-UZ')}</td>
      <td class="py-3 px-4 text-slate-400">${new Date(u.lastLogin || u.createdAt).toLocaleTimeString('uz-UZ')}</td>
    </tr>
  `).join('');
}

// ----------------------------------------------------
// Admin CRUD Actions (Tierlist & Punishments)
// ----------------------------------------------------
function openAddTierlistModal() {
  document.getElementById('add-tierlist-modal').classList.remove('hidden');
}
function closeAddTierlistModal() {
  document.getElementById('add-tierlist-modal').classList.add('hidden');
}

async function handleAddTierlistSubmit(e) {
  e.preventDefault();
  const playerNick = document.getElementById('tier-player-nick').value.trim();
  const tier = document.getElementById('tier-select').value;
  const elo = parseInt(document.getElementById('tier-points').value) || 1200;
  const playstyle = document.getElementById('tier-playstyle').value.trim();
  const kills = parseInt(document.getElementById('tier-kills').value) || 0;
  const deaths = parseInt(document.getElementById('tier-deaths').value) || 0;

  if (!playerNick) return;

  const newPlayer = {
    id: 'tier_' + Date.now(),
    playerNick,
    tier,
    elo,
    playstyle,
    kills,
    deaths
  };

  try {
    const token = localStorage.getItem('frokamc_token');
    await fetch(`${CONFIG.API_BASE_URL}/tierlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newPlayer)
    });
  } catch (e) {
    console.log('Tierlist local update fallback');
  }

  allTierlist.unshift(newPlayer);
  renderAdminTierlist(allTierlist);
  renderTierlist(allTierlist);
  closeAddTierlistModal();
  showToast(`O'yinchi ${playerNick} tierlistga qo'shildi!`, 'success');
}

async function deleteTierlistPlayer(id) {
  if (!confirm('Ushbu o\'yinchini tierlistdan o\'chirmoqchimisiz?')) return;
  try {
    const token = localStorage.getItem('frokamc_token');
    await fetch(`${CONFIG.API_BASE_URL}/tierlist/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } catch (e) {}

  allTierlist = allTierlist.filter(p => p.id !== id);
  renderAdminTierlist(allTierlist);
  renderTierlist(allTierlist);
  showToast('O\'yinchi tierlistdan o\'chirildi.', 'info');
}

function openAddPunishModal() {
  document.getElementById('add-punish-modal').classList.remove('hidden');
}
function closeAddPunishModal() {
  document.getElementById('add-punish-modal').classList.add('hidden');
}

async function handleAddPunishSubmit(e) {
  e.preventDefault();
  const playerNick = document.getElementById('punish-player-nick').value.trim();
  const type = document.getElementById('punish-type-select').value;
  const duration = document.getElementById('punish-duration').value.trim();
  const reason = document.getElementById('punish-reason').value.trim();

  if (!playerNick || !reason) return;

  const newPunish = {
    id: 'punish_' + Date.now(),
    playerNick,
    type,
    duration,
    reason,
    operator: currentUser ? (currentUser.displayName || currentUser.username) : 'Admin',
    active: true,
    createdAt: new Date().toISOString()
  };

  try {
    const token = localStorage.getItem('frokamc_token');
    await fetch(`${CONFIG.API_BASE_URL}/punishments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newPunish)
    });
  } catch (e) {}

  allPunishments.unshift(newPunish);
  renderAdminPunishments(allPunishments);
  renderPunishments(allPunishments);
  closeAddPunishModal();
  showToast(`${playerNick} ga ${type} jazosi qo'llandi!`, 'success');
}

async function unbanPlayer(id) {
  const p = allPunishments.find(x => x.id === id);
  if (p) {
    p.active = false;
    try {
      const token = localStorage.getItem('frokamc_token');
      await fetch(`${CONFIG.API_BASE_URL}/punishments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ active: false })
      });
    } catch (e) {}

    renderAdminPunishments(allPunishments);
    renderPunishments(allPunishments);
    showToast(`${p.playerNick} jazolardan ozod qilindi!`, 'success');
  }
}

async function deletePunishment(id) {
  allPunishments = allPunishments.filter(p => p.id !== id);
  try {
    const token = localStorage.getItem('frokamc_token');
    await fetch(`${CONFIG.API_BASE_URL}/punishments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } catch (e) {}
  renderAdminPunishments(allPunishments);
  renderPunishments(allPunishments);
  showToast('Jazo yozuvi o\'chirildi.', 'info');
}

async function handleProfileSave(e) {
  e.preventDefault();
  const displayName = document.getElementById('profile-name-input').value.trim();
  const email = document.getElementById('profile-email-input').value.trim();
  const currentPassword = document.getElementById('profile-current-pass').value;
  const newPassword = document.getElementById('profile-new-pass').value;
  const confirmPassword = document.getElementById('profile-confirm-pass').value;

  if (newPassword && newPassword !== confirmPassword) {
    showToast('Yangi parollar bir-biriga mos kelmadi!', 'error');
    return;
  }

  const payload = { displayName, email };
  if (newPassword) {
    payload.currentPassword = currentPassword;
    payload.newPassword = newPassword;
  }

  try {
    const token = localStorage.getItem('frokamc_token');
    const res = await fetch(`${CONFIG.API_BASE_URL}/admin/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      currentUser.displayName = displayName;
      currentUser.email = email;
      localStorage.setItem('frokamc_user', JSON.stringify(currentUser));
      renderAdminHeader();
      showToast('Admin ma\'lumotlari muvaffaqiyatli saqlandi!', 'success');
      return;
    }
  } catch (e) {}

  // Local fallback
  currentUser.displayName = displayName;
  currentUser.email = email;
  localStorage.setItem('frokamc_user', JSON.stringify(currentUser));
  renderAdminHeader();
  showToast('Admin sozlamalari yangilandi!', 'success');
}

// ----------------------------------------------------
// Initial Data Fetching for Portal
// ----------------------------------------------------
async function fetchInitialData() {
  fetchServerStatus();
  fetchRanks();
  fetchTierlist();
  fetchPunishments();
}

async function fetchServerStatus() {
  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/server/status`);
    const data = await res.json();
    if (data.success && data.data) {
      const info = data.data;
      const onlineEl = document.getElementById('stat-online-players');
      const ipTextEl = document.getElementById('server-ip-display');
      const praiseEl = document.getElementById('hero-praise-text');

      if (onlineEl) onlineEl.textContent = info.onlinePlayers || 142;
      if (ipTextEl) ipTextEl.textContent = info.serverIp || CONFIG.SERVER_IP;
      if (praiseEl && info.description) praiseEl.textContent = info.description;
    }
  } catch (err) {}
}

async function fetchRanks() {
  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/ranks`);
    const data = await res.json();
    if (data.success && data.ranks) {
      allRanks = data.ranks;
    } else {
      allRanks = DEFAULT_RANKS;
    }
  } catch (err) {
    allRanks = DEFAULT_RANKS;
  }
  renderRanks(allRanks);
}

function renderRanks(ranks) {
  const container = document.getElementById('ranks-grid');
  if (!container) return;

  container.innerHTML = ranks.map(rank => {
    const isImperator = rank.id === 'imperator';
    return `
      <div class="glass-card relative flex flex-col justify-between overflow-hidden border ${rank.border || 'border-slate-700/80'} group hover:scale-[1.01] transition-all duration-300">
        ${rank.popular ? `
          <div class="absolute -right-12 top-6 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[10px] tracking-wider uppercase px-12 py-1 rotate-45 shadow-md">
            TOP TAVSIYA
          </div>
        ` : ''}

        <div class="p-6">
          <div class="flex items-center justify-between gap-3 mb-4">
            <div class="flex items-center gap-2">
              <span class="text-2xl">${rank.badge}</span>
              <div>
                <h3 class="text-xl font-extrabold tracking-wide uppercase" style="color: ${rank.color}">
                  ${rank.name}
                </h3>
                <span class="text-xs text-slate-400">FrokaMC Donat Ranki</span>
              </div>
            </div>
            
            <button 
              onclick="openImageModal('${rank.image}', '${rank.name}')" 
              title="Kattalashtirib ko'rish" 
              class="relative group/img rounded-lg overflow-hidden border border-slate-700 bg-slate-900/60 p-1 hover:border-amber-400 transition"
            >
              <img src="${rank.image}" alt="${rank.name}" class="w-12 h-12 object-contain rounded" />
            </button>
          </div>

          <div class="bg-slate-900/90 rounded-xl p-3 mb-5 border border-slate-800">
            <div class="flex justify-between items-center text-sm mb-1.5 pb-1.5 border-b border-slate-800">
              <span class="text-slate-400 text-xs">🗓️ 30 kunlik:</span>
              <span class="font-bold text-amber-400 font-mono text-base">${Number(rank.price30).toLocaleString('uz-UZ')} UZS</span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-slate-400 text-xs">♾️ Butun umrga:</span>
              <span class="font-black text-emerald-400 font-mono text-base">${Number(rank.priceForever).toLocaleString('uz-UZ')} UZS</span>
            </div>
          </div>

          <div class="mb-4">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>⚔️</span> Asosiy Buyruqlar:
            </div>
            <div class="space-y-1.5">
              ${rank.commands.map(c => `
                <div class="flex items-center justify-between text-xs bg-slate-800/60 rounded px-2.5 py-1 font-mono">
                  <span class="text-amber-300 font-semibold">${c.cmd}</span>
                  <span class="text-[11px] text-slate-400 font-sans truncate ml-2">${c.desc}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="mb-5">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>✨</span> Imkoniyatlar:
            </div>
            <ul class="space-y-1.5 text-xs text-slate-300">
              ${rank.features.map(f => `
                <li class="flex items-center justify-between bg-slate-900/40 rounded px-2 py-0.5">
                  <span class="text-slate-400 flex items-center gap-1">
                    <span class="text-emerald-400">✓</span> ${f.name}:
                  </span>
                  <span class="font-semibold text-slate-200">${f.value}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>

        <div class="p-6 pt-0">
          <button 
            onclick="openRankPurchaseModal('${rank.id}')"
            class="w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition duration-200 shadow-md ${
              isImperator 
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black shadow-amber-500/30' 
                : 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white border border-slate-700 hover:border-amber-500'
            }"
          >
            <span>Sotib Olish (@FrokaMC)</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

async function fetchTierlist() {
  const container = document.getElementById('tierlist-container');
  if (!container) return;

  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/tierlist`);
    const data = await res.json();
    if (data.success && data.tierlist) {
      allTierlist = data.tierlist;
    }
  } catch (err) {
    if (!allTierlist.length) {
      allTierlist = [
        { id: '1', playerNick: 'AxoPlayer', tier: 'S+', elo: 1850, playstyle: 'Sword Combo', kills: 142, deaths: 18 },
        { id: '2', playerNick: 'UzbekNinja', tier: 'S', elo: 1620, playstyle: 'Crystal PvP', kills: 98, deaths: 24 },
        { id: '3', playerNick: 'Steve_Warrior', tier: 'A', elo: 1390, playstyle: 'Axe & Shield', kills: 65, deaths: 31 }
      ];
    }
  }
  renderTierlist(allTierlist);
}

function renderTierlist(items) {
  const container = document.getElementById('tierlist-container');
  if (!container) return;

  if (!items || !items.length) {
    container.innerHTML = `
      <div class="text-center py-12 px-4 glass-card border border-dashed border-slate-700">
        <div class="text-4xl mb-3">⚔️</div>
        <h4 class="text-lg font-bold text-white mb-1">Tierlist yangilanmoqda</h4>
        <p class="text-sm text-slate-400">Tez orada eng kuchli o'yinchilar bu yerda ko'rinadi.</p>
      </div>
    `;
    return;
  }

  const getTierClass = (tier) => {
    switch (tier) {
      case 'S+': return 'badge-tier-splus';
      case 'S': return 'badge-tier-s';
      case 'A': return 'badge-tier-a';
      case 'B': return 'badge-tier-b';
      case 'C': return 'badge-tier-c';
      default: return 'bg-slate-700 text-white';
    }
  };

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      ${items.map((player, idx) => `
        <div class="glass-card p-4 flex items-center justify-between gap-3 border border-slate-800 hover:border-slate-600 transition">
          <div class="flex items-center gap-3">
            <div class="relative">
              <img 
                src="${getSkinAvatarUrl(player.playerNick, 48)}" 
                alt="${player.playerNick}" 
                class="w-12 h-12 rounded-lg skin-head border border-slate-700"
                onerror="this.src='https://mc-heads.net/avatar/steve/48'"
              />
              <span class="absolute -bottom-1 -right-1 text-[10px] font-black px-1.5 py-0.2 rounded ${getTierClass(player.tier)}">
                ${player.tier}
              </span>
            </div>

            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs text-slate-500 font-mono">#${idx + 1}</span>
                <span class="font-extrabold text-white text-base">${player.playerNick}</span>
              </div>
              <div class="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span class="text-amber-400">⚔️ ${player.playstyle || 'PvP Master'}</span>
                <span>•</span>
                <span class="text-slate-500">${player.kills || 0}K / ${player.deaths || 0}D</span>
              </div>
            </div>
          </div>

          <div class="text-right">
            <div class="text-sm font-black font-mono text-cyan-400">${player.elo || 1000}</div>
            <div class="text-[10px] text-slate-500 uppercase tracking-wider">ELO BALL</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

async function fetchPunishments(typeFilter = 'ALL', searchQuery = '') {
  const tbody = document.getElementById('punishments-table-body');
  if (!tbody) return;

  try {
    let url = `${CONFIG.API_BASE_URL}/punishments?type=${encodeURIComponent(typeFilter)}`;
    if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

    const res = await fetch(url);
    const data = await res.json();
    if (data.success && data.punishments) {
      allPunishments = data.punishments;
    }
  } catch (err) {
    if (!allPunishments.length) {
      allPunishments = [
        { id: 'p1', playerNick: 'CheaterPro', type: 'BAN', reason: 'KillAura cheat', operator: 'Bosh Admin', duration: 'Abadiy', active: true, createdAt: new Date().toISOString() },
        { id: 'p2', playerNick: 'Spammer99', type: 'MUTE', reason: 'Chatda reklama va haqorat', operator: 'Katta Moderator', duration: '24 soat', active: true, createdAt: new Date().toISOString() }
      ];
    }
  }

  let filtered = allPunishments;
  if (typeFilter && typeFilter !== 'ALL') {
    filtered = filtered.filter(p => p.type === typeFilter);
  }
  if (searchQuery) {
    filtered = filtered.filter(p => p.playerNick.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  renderPunishments(filtered);
}

function renderPunishments(items) {
  const tbody = document.getElementById('punishments-table-body');
  if (!tbody) return;

  if (!items || !items.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-10 text-slate-400">
          <div class="text-3xl mb-2">🛡️</div>
          Hozircha jazo olgan o'yinchilar yo'q. Qoidalarga rioya qilayotganingiz uchun rahmat!
        </td>
      </tr>
    `;
    return;
  }

  const getTypeBadge = (type) => {
    switch (type.toUpperCase()) {
      case 'BAN':
        return '<span class="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">BAN</span>';
      case 'MUTE':
        return '<span class="px-2 py-0.5 rounded text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">MUTE</span>';
      default:
        return `<span class="px-2 py-0.5 rounded text-xs font-bold bg-slate-700 text-slate-300">${type}</span>`;
    }
  };

  tbody.innerHTML = items.map(p => `
    <tr class="border-b border-slate-800/80 hover:bg-slate-800/30 transition text-sm">
      <td class="py-3 px-4">
        <div class="flex items-center gap-2.5">
          <img 
            src="${getSkinAvatarUrl(p.playerNick, 28)}" 
            alt="${p.playerNick}" 
            class="w-7 h-7 rounded skin-head border border-slate-700"
            onerror="this.src='https://mc-heads.net/avatar/steve/28'"
          />
          <span class="font-bold text-white">${p.playerNick}</span>
        </div>
      </td>
      <td class="py-3 px-4">${getTypeBadge(p.type)}</td>
      <td class="py-3 px-4 text-slate-300 max-w-xs truncate" title="${p.reason}">${p.reason}</td>
      <td class="py-3 px-4 text-slate-400 text-xs">
        <span class="text-amber-400/90 font-semibold">🛡️ ${p.operator || 'Admin'}</span>
      </td>
      <td class="py-3 px-4 text-slate-300 font-mono text-xs">${p.duration}</td>
      <td class="py-3 px-4">
        ${p.active !== false 
          ? '<span class="inline-flex items-center gap-1 text-xs text-red-400 font-semibold"><span class="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>Faol</span>' 
          : '<span class="text-xs text-slate-500 font-medium">Tugagan</span>'}
      </td>
    </tr>
  `).join('');
}

// ----------------------------------------------------
// Modals & User Actions
// ----------------------------------------------------
function copyServerIP() {
  const ip = CONFIG.SERVER_IP || 'play.frokamc.uz';
  navigator.clipboard.writeText(ip).then(() => {
    showToast(`Server IP nusxalandi: ${ip}`, 'success');
  }).catch(() => {
    showToast(`Server IP: ${ip}`, 'info');
  });
}

function openRankPurchaseModal(rankId) {
  const rank = allRanks.find(r => r.id === rankId);
  if (!rank) return;

  const modal = document.getElementById('purchase-modal');
  const title = document.getElementById('purchase-modal-title');
  const details = document.getElementById('purchase-modal-details');

  title.innerHTML = `${rank.badge} ${rank.name} Rankini Sotib Olish`;
  const prefilledNick = currentUser ? (currentUser.nickname || currentUser.username) : '';

  details.innerHTML = `
    <div class="mb-4 text-center">
      <img src="${rank.image}" alt="${rank.name}" class="h-28 mx-auto object-contain rounded-lg border border-slate-700 p-1 mb-2 bg-slate-900" />
      <div class="text-sm text-slate-300">
        Telegram orqali to'lov qilingandan so'ng rank serverda avtomatik beriladi.
      </div>
    </div>

    <div class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-slate-300 mb-1">Minecraft Nikingiz:</label>
        <input 
          type="text" 
          id="buy-player-nick" 
          placeholder="Masalan: ${prefilledNick || 'Steve'}" 
          value="${prefilledNick}"
          class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono focus:border-amber-400 focus:outline-none"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-300 mb-1">Muddati tanlang:</label>
        <div class="grid grid-cols-2 gap-3">
          <label class="flex flex-col p-3 rounded-xl border border-slate-700 bg-slate-900/60 cursor-pointer hover:border-amber-400 has-[:checked]:border-amber-400 has-[:checked]:bg-amber-500/10 transition">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-bold text-white">30 Kun</span>
              <input type="radio" name="rank-duration" value="30kun" checked class="text-amber-500 focus:ring-0" />
            </div>
            <span class="text-amber-400 font-mono font-bold text-sm">${Number(rank.price30).toLocaleString('uz-UZ')} UZS</span>
          </label>

          <label class="flex flex-col p-3 rounded-xl border border-slate-700 bg-slate-900/60 cursor-pointer hover:border-emerald-400 has-[:checked]:border-emerald-400 has-[:checked]:bg-emerald-500/10 transition">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-bold text-white">Butun Umrga</span>
              <input type="radio" name="rank-duration" value="forever" class="text-emerald-500 focus:ring-0" />
            </div>
            <span class="text-emerald-400 font-mono font-bold text-sm">${Number(rank.priceForever).toLocaleString('uz-UZ')} UZS</span>
          </label>
        </div>
      </div>

      <button 
        onclick="proceedToTelegramPurchase('${rank.id}', '${rank.name}')" 
        class="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition mt-2"
      >
        <span>Telegram orqali xarid qilish (@FrokaMC)</span>
      </button>
    </div>
  `;

  modal.classList.remove('hidden');
}

function proceedToTelegramPurchase(rankId, rankName) {
  const nickInput = document.getElementById('buy-player-nick');
  const nick = nickInput ? nickInput.value.trim() : '';

  if (!nick) {
    showToast('Iltimos, Minecraft nikingizni kiriting!', 'error');
    return;
  }

  const durationRadio = document.querySelector('input[name="rank-duration"]:checked');
  const duration = durationRadio && durationRadio.value === 'forever' ? 'Butun umrga (Abadiy)' : '30 kunga';

  const rank = allRanks.find(r => r.id === rankId);
  const price = durationRadio && durationRadio.value === 'forever' ? rank.priceForever : rank.price30;

  const text = `Salom, men FrokaMC serveridan donat xarid qilmoqchiman:\n\n` +
               `👑 Rank: ${rankName}\n` +
               `👤 Minecraft Nikim: ${nick}\n` +
               `⏳ Muddati: ${duration}\n` +
               `💰 Narxi: ${Number(price).toLocaleString('uz-UZ')} UZS\n\n` +
               `Iltimos, to'lov rekvizitlarini tashlab bering.`;

  window.open(`https://t.me/FrokaMC?text=${encodeURIComponent(text)}`, '_blank');
  closePurchaseModal();
  showToast('Telegramga yo\'naltirilmoqda...', 'success');
}

function closePurchaseModal() {
  document.getElementById('purchase-modal')?.classList.add('hidden');
}

function openImageModal(imgSrc, title) {
  const modal = document.getElementById('image-modal');
  const img = document.getElementById('modal-zoomed-image');
  const titleEl = document.getElementById('image-modal-title');
  if (modal && img) {
    img.src = imgSrc;
    if (titleEl) titleEl.textContent = title;
    modal.classList.remove('hidden');
  }
}

function closeImageModal() {
  document.getElementById('image-modal')?.classList.add('hidden');
}

// ----------------------------------------------------
// Event Listeners Binding
// ----------------------------------------------------
function initEventListeners() {
  // Login input live avatar preview
  const loginUser = document.getElementById('input-login-username');
  if (loginUser) {
    loginUser.addEventListener('input', () => {
      triggerLoginAvatarPreview(loginUser.value);
    });
  }

  // Register nick live preview
  const regNick = document.getElementById('input-register-nick');
  const regAvatar = document.getElementById('register-skin-preview');
  if (regNick && regAvatar) {
    regNick.addEventListener('input', () => {
      const val = regNick.value.trim();
      if (val.length >= 3) {
        regAvatar.src = getSkinAvatarUrl(val, 64);
      } else {
        regAvatar.src = 'https://mc-heads.net/avatar/steve/64';
      }
    });
  }

  // Forms
  document.getElementById('auth-login-form')?.addEventListener('submit', handleUnifiedLogin);
  document.getElementById('auth-register-form')?.addEventListener('submit', handleUnifiedRegister);
  document.getElementById('add-tierlist-form')?.addEventListener('submit', handleAddTierlistSubmit);
  document.getElementById('add-punish-form')?.addEventListener('submit', handleAddPunishSubmit);
  document.getElementById('admin-profile-form')?.addEventListener('submit', handleProfileSave);

  // Copy IP buttons
  document.getElementById('btn-copy-ip')?.addEventListener('click', copyServerIP);
  document.getElementById('hero-copy-ip-btn')?.addEventListener('click', copyServerIP);

  // Admin Tab Navigation
  document.querySelectorAll('.admin-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      document.querySelectorAll('.admin-nav-item').forEach(b => {
        b.classList.remove('bg-amber-500/20', 'text-amber-400', 'border-amber-500/30');
        b.classList.add('text-slate-400');
      });
      btn.classList.add('bg-amber-500/20', 'text-amber-400', 'border-amber-500/30');
      btn.classList.remove('text-slate-400');

      document.querySelectorAll('.admin-tab-content').forEach(tab => tab.classList.add('hidden'));
      document.getElementById(`tab-${target}`)?.classList.remove('hidden');
    });
  });

  // Punishments filter
  document.querySelectorAll('.punish-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.punish-filter-btn').forEach(b => {
        b.classList.remove('bg-amber-500', 'text-slate-950', 'font-bold');
        b.classList.add('bg-slate-800', 'text-slate-300');
      });
      btn.classList.add('bg-amber-500', 'text-slate-950', 'font-bold');
      btn.classList.remove('bg-slate-800', 'text-slate-300');

      const type = btn.getAttribute('data-type');
      const search = document.getElementById('punish-search-input')?.value || '';
      fetchPunishments(type, search);
    });
  });

  // Punishments search
  const punishSearch = document.getElementById('punish-search-input');
  if (punishSearch) {
    let timer;
    punishSearch.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const activeBtn = document.querySelector('.punish-filter-btn.bg-amber-500');
        const type = activeBtn ? activeBtn.getAttribute('data-type') : 'ALL';
        fetchPunishments(type, punishSearch.value);
      }, 300);
    });
  }

  // Tierlist search
  const tierSearch = document.getElementById('tierlist-search-input');
  if (tierSearch) {
    tierSearch.addEventListener('input', () => {
      const val = tierSearch.value.trim().toLowerCase();
      if (!val) {
        renderTierlist(allTierlist);
      } else {
        const filtered = allTierlist.filter(p => p.playerNick.toLowerCase().includes(val));
        renderTierlist(filtered);
      }
    });
  }

  // Overlay click to close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.add('hidden');
      }
    });
  });
}
