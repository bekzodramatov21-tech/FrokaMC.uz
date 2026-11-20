// FrokaMC.uz Admin Dashboard Logic

let currentAdmin = null;
let adminToken = localStorage.getItem('frokamc_admin_token');
let adminTierlist = [];
let adminPunishments = [];
let adminUsers = [];

document.addEventListener('DOMContentLoaded', () => {
  checkAdminAuth();
  initAdminTabs();
  initAdminEventListeners();
});

// Check if admin is authenticated
async function checkAdminAuth() {
  if (!adminToken) {
    showAdminLoginModal();
    return;
  }

  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/admin/profile`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success && data.profile) {
      currentAdmin = data.profile;
      hideAdminLoginModal();
      renderAdminProfileUI();
      loadDashboardData();
    } else {
      adminLogout();
    }
  } catch (err) {
    console.error('Admin auth check failed:', err);
    showAdminLoginModal();
  }
}

function showAdminLoginModal() {
  const modal = document.getElementById('admin-login-modal');
  if (modal) modal.classList.remove('hidden');
}

function hideAdminLoginModal() {
  const modal = document.getElementById('admin-login-modal');
  if (modal) modal.classList.add('hidden');
}

function adminLogout() {
  localStorage.removeItem('frokamc_admin_token');
  adminToken = null;
  currentAdmin = null;
  showAdminLoginModal();
  showToast('Admin tizimidan chiqildi.', 'info');
}

function renderAdminProfileUI() {
  if (!currentAdmin) return;
  const nameEl = document.getElementById('admin-display-name');
  const roleEl = document.getElementById('admin-display-role');
  const emailInput = document.getElementById('profile-email-input');
  const nameInput = document.getElementById('profile-name-input');

  if (nameEl) nameEl.textContent = currentAdmin.displayName || currentAdmin.username;
  if (roleEl) roleEl.textContent = currentAdmin.role === 'superadmin' ? 'Bosh Admin' : 'Moderator';
  if (emailInput) emailInput.value = currentAdmin.email || '';
  if (nameInput) nameInput.value = currentAdmin.displayName || currentAdmin.username;
}

// ----------------------------------------------------
// Tab Navigation
// ----------------------------------------------------
function initAdminTabs() {
  const navBtns = document.querySelectorAll('.admin-nav-item');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      // Update active nav button
      navBtns.forEach(b => {
        b.classList.remove('bg-amber-500/20', 'text-amber-400', 'border-amber-500');
        b.classList.add('text-slate-400');
      });
      btn.classList.add('bg-amber-500/20', 'text-amber-400', 'border-amber-500');
      btn.classList.remove('text-slate-400');

      // Show tab content
      document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.add('hidden');
      });
      const activeTab = document.getElementById(`tab-${target}`);
      if (activeTab) activeTab.classList.remove('hidden');
    });
  });
}

// ----------------------------------------------------
// Load Dashboard Data
// ----------------------------------------------------
async function loadDashboardData() {
  await Promise.all([
    loadStats(),
    loadAdminTierlist(),
    loadAdminPunishments(),
    loadAdminUsers()
  ]);
}

async function loadStats() {
  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success && data.stats) {
      const s = data.stats;
      document.getElementById('stat-total-users').textContent = s.totalUsers || 0;
      document.getElementById('stat-total-tierlist').textContent = s.tierlistCount || 0;
      document.getElementById('stat-total-bans').textContent = s.activeBans || 0;
      document.getElementById('stat-total-mutes').textContent = s.activeMutes || 0;
    }
  } catch (err) {
    console.error('Load stats error:', err);
  }
}

// ----------------------------------------------------
// Tierlist Management
// ----------------------------------------------------
async function loadAdminTierlist() {
  const tbody = document.getElementById('admin-tierlist-tbody');
  if (!tbody) return;

  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/tierlist`);
    const data = await res.json();
    if (data.success) {
      adminTierlist = data.tierlist || [];
      renderAdminTierlist(adminTierlist);
    }
  } catch (err) {
    console.error('Load admin tierlist error:', err);
  }
}

function renderAdminTierlist(items) {
  const tbody = document.getElementById('admin-tierlist-tbody');
  if (!tbody) return;

  if (!items || items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-8 text-slate-400">
          Tierlistda hozircha o'yinchilar yo'q. Yuqoridagi "Yangi O'yinchi Qo'shish" tugmasini bosing.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = items.map(p => `
    <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition">
      <td class="py-3 px-4">
        <div class="flex items-center gap-2">
          <img src="${getSkinAvatarUrl(p.playerNick, 28)}" class="w-7 h-7 rounded skin-head border border-slate-700" />
          <span class="font-bold text-white">${p.playerNick}</span>
        </div>
      </td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
          ${p.tier}
        </span>
      </td>
      <td class="py-3 px-4 text-cyan-400 font-mono font-bold">${p.elo || 1000}</td>
      <td class="py-3 px-4 text-slate-300 text-xs">${p.playstyle || '-'}</td>
      <td class="py-3 px-4 text-slate-400 font-mono text-xs">${p.kills || 0} / ${p.deaths || 0}</td>
      <td class="py-3 px-4 text-right space-x-2">
        <button 
          onclick="openEditTierlistModal('${p.id}')" 
          class="text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 px-2.5 py-1.5 rounded transition"
        >
          Tahrirlash
        </button>
        <button 
          onclick="deleteTierlistEntry('${p.id}', '${p.playerNick}')" 
          class="text-xs bg-red-900/40 hover:bg-red-800 text-red-300 px-2.5 py-1.5 rounded transition"
        >
          O'chirish
        </button>
      </td>
    </tr>
  `).join('');
}

async function deleteTierlistEntry(id, nick) {
  if (!confirm(`${nick} o'yinchisini tierlistdan o'chirishga ishonchingiz komilmi?`)) return;

  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/tierlist/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      loadAdminTierlist();
      loadStats();
    } else {
      showToast(data.message, 'error');
    }
  } catch (err) {
    showToast('Xatolik yuz berdi', 'error');
  }
}

// ----------------------------------------------------
// Punishments Management
// ----------------------------------------------------
async function loadAdminPunishments() {
  const tbody = document.getElementById('admin-punish-tbody');
  if (!tbody) return;

  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/punishments`);
    const data = await res.json();
    if (data.success) {
      adminPunishments = data.punishments || [];
      renderAdminPunishments(adminPunishments);
    }
  } catch (err) {
    console.error('Load admin punishments error:', err);
  }
}

function renderAdminPunishments(items) {
  const tbody = document.getElementById('admin-punish-tbody');
  if (!tbody) return;

  if (!items || items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-8 text-slate-400">
          Hech qanday jazo yozuvi mavjud emas.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = items.map(p => `
    <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition">
      <td class="py-3 px-4">
        <div class="flex items-center gap-2">
          <img src="${getSkinAvatarUrl(p.playerNick, 28)}" class="w-7 h-7 rounded skin-head border border-slate-700" />
          <span class="font-bold text-white">${p.playerNick}</span>
        </div>
      </td>
      <td class="py-3 px-4 font-bold text-xs">${p.type}</td>
      <td class="py-3 px-4 text-slate-300 text-xs max-w-xs truncate">${p.reason}</td>
      <td class="py-3 px-4 text-amber-400 text-xs">${p.operator}</td>
      <td class="py-3 px-4 text-slate-300 text-xs">${p.duration}</td>
      <td class="py-3 px-4">
        ${p.active !== false 
          ? '<span class="text-xs text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">Faol</span>' 
          : '<span class="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">Tugagan</span>'}
      </td>
      <td class="py-3 px-4 text-right space-x-2">
        <button 
          onclick="togglePunishmentStatus('${p.id}', ${p.active !== false})" 
          class="text-xs ${p.active !== false ? 'bg-amber-600/30 text-amber-300' : 'bg-emerald-600/30 text-emerald-300'} px-2.5 py-1 rounded transition"
        >
          ${p.active !== false ? 'Bekor qilish (Unban)' : 'Qayta faollashtirish'}
        </button>
        <button 
          onclick="deletePunishment('${p.id}', '${p.playerNick}')" 
          class="text-xs bg-red-900/40 hover:bg-red-800 text-red-300 px-2.5 py-1 rounded transition"
        >
          O'chirish
        </button>
      </td>
    </tr>
  `).join('');
}

async function togglePunishmentStatus(id, currentActive) {
  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/punishments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ active: !currentActive })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      loadAdminPunishments();
      loadStats();
    } else {
      showToast(data.message, 'error');
    }
  } catch (err) {
    showToast('Xatolik yuz berdi', 'error');
  }
}

async function deletePunishment(id, nick) {
  if (!confirm(`${nick} o'yinchisining jazo yozuvini butunlay o'chirishga ishonchingiz komilmi?`)) return;

  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/punishments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message, 'success');
      loadAdminPunishments();
      loadStats();
    } else {
      showToast(data.message, 'error');
    }
  } catch (err) {
    showToast('Xatolik yuz berdi', 'error');
  }
}

// ----------------------------------------------------
// Registered Users Management
// ----------------------------------------------------
async function loadAdminUsers() {
  const tbody = document.getElementById('admin-users-tbody');
  if (!tbody) return;

  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    if (data.success) {
      adminUsers = data.users || [];
      renderAdminUsers(adminUsers);
    }
  } catch (err) {
    console.error('Load admin users error:', err);
  }
}

function renderAdminUsers(users) {
  const tbody = document.getElementById('admin-users-tbody');
  if (!tbody) return;

  if (!users || users.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-8 text-slate-400">
          Hozircha ro'yxatdan o'tgan foydalanuvchilar mavjud emas.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = users.map(u => `
    <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition">
      <td class="py-3 px-4">
        <div class="flex items-center gap-2">
          <img src="${getSkinAvatarUrl(u.nickname, 28)}" class="w-7 h-7 rounded skin-head border border-slate-700" />
          <span class="font-bold text-white">${u.nickname}</span>
        </div>
      </td>
      <td class="py-3 px-4">
        <span class="text-xs bg-slate-800 text-amber-400 px-2 py-0.5 rounded border border-slate-700">
          ${u.rank || 'O\'yinchi'}
        </span>
      </td>
      <td class="py-3 px-4 text-slate-400 text-xs font-mono">
        ${new Date(u.createdAt).toLocaleDateString('uz-UZ')}
      </td>
      <td class="py-3 px-4 text-slate-400 text-xs font-mono">
        ${new Date(u.lastLogin).toLocaleString('uz-UZ')}
      </td>
    </tr>
  `).join('');
}

// ----------------------------------------------------
// Form Handlers & Event Listeners
// ----------------------------------------------------
function initAdminEventListeners() {
  // Admin Login Form
  const adminLoginForm = document.getElementById('admin-login-form');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('admin-username-input').value.trim();
      const password = document.getElementById('admin-password-input').value;

      try {
        const res = await fetch(`${CONFIG.API_BASE_URL}/auth/admin-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.success) {
          adminToken = data.token;
          currentAdmin = data.admin;
          localStorage.setItem('frokamc_admin_token', adminToken);
          hideAdminLoginModal();
          renderAdminProfileUI();
          loadDashboardData();
          showToast(data.message, 'success');
        } else {
          showToast(data.message || 'Kirish muvaffaqiyatsiz', 'error');
        }
      } catch (err) {
        showToast('Serverga ulanishda xatolik', 'error');
      }
    });
  }

  // Admin Logout Button
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', adminLogout);

  // Add Tierlist Form
  const addTierlistForm = document.getElementById('add-tierlist-form');
  if (addTierlistForm) {
    addTierlistForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const playerNick = document.getElementById('tier-player-nick').value.trim();
      const tier = document.getElementById('tier-select').value;
      const points = document.getElementById('tier-points').value;
      const playstyle = document.getElementById('tier-playstyle').value;
      const kills = document.getElementById('tier-kills').value;
      const deaths = document.getElementById('tier-deaths').value;

      try {
        const res = await fetch(`${CONFIG.API_BASE_URL}/tierlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({ playerNick, tier, points, playstyle, kills, deaths })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, 'success');
          addTierlistForm.reset();
          closeAddTierlistModal();
          loadAdminTierlist();
          loadStats();
        } else {
          showToast(data.message || 'Xatolik', 'error');
        }
      } catch (err) {
        showToast('Server xatosi', 'error');
      }
    });
  }

  // Add Punishment Form
  const addPunishForm = document.getElementById('add-punish-form');
  if (addPunishForm) {
    addPunishForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const playerNick = document.getElementById('punish-player-nick').value.trim();
      const type = document.getElementById('punish-type-select').value;
      const reason = document.getElementById('punish-reason').value.trim();
      const duration = document.getElementById('punish-duration').value.trim();

      try {
        const res = await fetch(`${CONFIG.API_BASE_URL}/punishments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({ playerNick, type, reason, duration, operator: currentAdmin.username })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message, 'success');
          addPunishForm.reset();
          closeAddPunishModal();
          loadAdminPunishments();
          loadStats();
        } else {
          showToast(data.message || 'Xatolik', 'error');
        }
      } catch (err) {
        showToast('Server xatosi', 'error');
      }
    });
  }

  // Update Profile Form (Gmail & Password change)
  const profileForm = document.getElementById('admin-profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('profile-email-input').value.trim();
      const displayName = document.getElementById('profile-name-input').value.trim();
      const currentPassword = document.getElementById('profile-current-pass').value;
      const newPassword = document.getElementById('profile-new-pass').value;
      const confirmPassword = document.getElementById('profile-confirm-pass').value;

      if (newPassword && newPassword !== confirmPassword) {
        showToast('Yangi parollar mos kelmadi!', 'error');
        return;
      }

      try {
        const body = { email, displayName };
        if (newPassword) {
          body.currentPassword = currentPassword;
          body.newPassword = newPassword;
        }

        const res = await fetch(`${CONFIG.API_BASE_URL}/admin/update-profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.success) {
          currentAdmin = data.profile;
          renderAdminProfileUI();
          showToast(data.message, 'success');
          document.getElementById('profile-current-pass').value = '';
          document.getElementById('profile-new-pass').value = '';
          document.getElementById('profile-confirm-pass').value = '';
        } else {
          showToast(data.message || 'Yangilab bo\'lmadi', 'error');
        }
      } catch (err) {
        showToast('Serverga ulanishda xatolik', 'error');
      }
    });
  }
}

// Modal Toggle Helpers
function openAddTierlistModal() {
  const modal = document.getElementById('add-tierlist-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeAddTierlistModal() {
  const modal = document.getElementById('add-tierlist-modal');
  if (modal) modal.classList.add('hidden');
}

function openAddPunishModal() {
  const modal = document.getElementById('add-punish-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeAddPunishModal() {
  const modal = document.getElementById('add-punish-modal');
  if (modal) modal.classList.add('hidden');
}
