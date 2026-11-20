// FrokaMC.uz Frontend Application Logic

let currentUser = null;
let allRanks = [];
let allTierlist = [];
let allPunishments = [];

// Initialize on DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  fetchServerStatus();
  fetchRanks();
  fetchTierlist();
  fetchPunishments();
  initEventListeners();
});

// ----------------------------------------------------
// Authentication & Session
// ----------------------------------------------------
function initAuth() {
  const token = localStorage.getItem('frokamc_token');
  const savedUser = localStorage.getItem('frokamc_user');

  if (token && savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      renderUserAuthUI();
      // Re-verify with backend in background
      verifySession(token);
    } catch (e) {
      logout();
    }
  } else {
    renderUserAuthUI();
  }
}

async function verifySession(token) {
  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      currentUser = { ...currentUser, ...data.user, isAdmin: data.isAdmin };
      localStorage.setItem('frokamc_user', JSON.stringify(currentUser));
      renderUserAuthUI();
    } else {
      logout();
    }
  } catch (err) {
    // If offline or network issue, keep cached user session
    console.warn('Backend connection notice:', err.message);
  }
}

function renderUserAuthUI() {
  const authContainer = document.getElementById('user-auth-container');
  const adminNavBtn = document.getElementById('admin-nav-link');
  if (!authContainer) return;

  if (currentUser) {
    // Show logged-in player badge
    authContainer.innerHTML = `
      <div class="flex items-center gap-3 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-full shadow-inner">
        <img 
          src="${getSkinAvatarUrl(currentUser.nickname, 32)}" 
          alt="${currentUser.nickname}" 
          class="w-7 h-7 rounded-md skin-head border border-amber-500/40"
          onerror="this.src='https://mc-heads.net/avatar/steve/32'"
        />
        <div class="flex flex-col text-left">
          <span class="text-xs font-bold text-white flex items-center gap-1.5">
            ${currentUser.nickname}
            <span class="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded font-semibold border border-amber-500/30">
              ${currentUser.rank || 'O\'yinchi'}
            </span>
          </span>
        </div>
        <button 
          id="btn-logout" 
          title="Chiqish" 
          class="text-xs text-red-400 hover:text-red-300 ml-1 p-1 hover:bg-red-500/10 rounded transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    `;

    document.getElementById('btn-logout').addEventListener('click', () => {
      logout();
      showToast('Tizimdan muvaffaqiyatli chiqdingiz.', 'info');
    });

    if (adminNavBtn) {
      if (currentUser.isAdmin || currentUser.type === 'admin') {
        adminNavBtn.classList.remove('hidden');
      } else {
        adminNavBtn.classList.add('hidden');
      }
    }
  } else {
    // Show Login / Register button
    authContainer.innerHTML = `
      <button 
        id="btn-open-login" 
        class="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm transition transform hover:scale-[1.02] shadow-lg shadow-amber-500/20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
        <span>Kirish / Ro'yxatdan o'tish</span>
      </button>
    `;

    document.getElementById('btn-open-login').addEventListener('click', openLoginModal);
    if (adminNavBtn) adminNavBtn.classList.add('hidden');
  }
}

function logout() {
  localStorage.removeItem('frokamc_token');
  localStorage.removeItem('frokamc_user');
  currentUser = null;
  renderUserAuthUI();
}

// ----------------------------------------------------
// Server Status & Copy IP
// ----------------------------------------------------
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
  } catch (err) {
    console.warn('Server status fetch failed, using defaults');
  }
}

function copyServerIP() {
  const ip = CONFIG.SERVER_IP || 'play.frokamc.uz';
  navigator.clipboard.writeText(ip).then(() => {
    showToast(`Server IP nusxalandi: ${ip}`, 'success');
    const copyBtn = document.getElementById('btn-copy-ip');
    if (copyBtn) {
      const originalHtml = copyBtn.innerHTML;
      copyBtn.innerHTML = `
        <span class="text-emerald-400 font-bold flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Nusxalandi!
        </span>
      `;
      setTimeout(() => {
        copyBtn.innerHTML = originalHtml;
      }, 2500);
    }
  }).catch(() => {
    showToast(`Server IP: ${ip}`, 'info');
  });
}

// ----------------------------------------------------
// Ranks Fetch & Render
// ----------------------------------------------------
async function fetchRanks() {
  const container = document.getElementById('ranks-grid');
  if (!container) return;

  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/ranks`);
    const data = await res.json();
    if (data.success && data.ranks) {
      allRanks = data.ranks;
      renderRanks(allRanks);
    }
  } catch (err) {
    console.error('Ranks fetch error:', err);
    container.innerHTML = `<div class="col-span-full text-center text-red-400 py-8">Ranklarni yuklab bo'lmadi. Backend ishlayotganini tekshiring.</div>`;
  }
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
          <!-- Rank Header -->
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
            
            <!-- Rank Image Thumbnail -->
            <button 
              onclick="openImageModal('${rank.image}', '${rank.name}')" 
              title="Kattalashtirib ko'rish" 
              class="relative group/img rounded-lg overflow-hidden border border-slate-700 bg-slate-900/60 p-1 hover:border-amber-400 transition"
            >
              <img src="${rank.image}" alt="${rank.name}" class="w-12 h-12 object-contain rounded" />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
            </button>
          </div>

          <!-- Price Display -->
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

          <!-- Commands / Buyruqlar -->
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

          <!-- Features / Imkoniyatlar -->
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

        <!-- Buy Action Button -->
        <div class="p-6 pt-0">
          <button 
            onclick="openRankPurchaseModal('${rank.id}')"
            class="w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition duration-200 shadow-md ${
              isImperator 
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black shadow-amber-500/30' 
                : 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white border border-slate-700 hover:border-amber-500'
            }"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <span>Sotib Olish (@FrokaMC)</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ----------------------------------------------------
// PvP Tierlist Fetch & Render
// ----------------------------------------------------
async function fetchTierlist() {
  const container = document.getElementById('tierlist-container');
  if (!container) return;

  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/tierlist`);
    const data = await res.json();
    if (data.success) {
      allTierlist = data.tierlist || [];
      renderTierlist(allTierlist);
    }
  } catch (err) {
    console.error('Tierlist fetch error:', err);
  }
}

function renderTierlist(items) {
  const container = document.getElementById('tierlist-container');
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 px-4 glass-card border border-dashed border-slate-700">
        <div class="text-4xl mb-3">⚔️</div>
        <h4 class="text-lg font-bold text-white mb-1">Tierlist hozircha yangilanmoqda</h4>
        <p class="text-sm text-slate-400 max-w-md mx-auto">
          O'yinchilarning eng so'nggi PvP natijalari server ma'muriyati (Admin paneli) orqali e'lon qilinadi.
        </p>
      </div>
    `;
    return;
  }

  // Tier Badge Color Selector
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

// ----------------------------------------------------
// Punishments (Bans / Mutes) Fetch & Render
// ----------------------------------------------------
async function fetchPunishments(typeFilter = 'ALL', searchQuery = '') {
  const tbody = document.getElementById('punishments-table-body');
  if (!tbody) return;

  try {
    let url = `${CONFIG.API_BASE_URL}/punishments?type=${encodeURIComponent(typeFilter)}`;
    if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

    const res = await fetch(url);
    const data = await res.json();
    if (data.success) {
      allPunishments = data.punishments || [];
      renderPunishments(allPunishments);
    }
  } catch (err) {
    console.error('Punishments fetch error:', err);
  }
}

function renderPunishments(items) {
  const tbody = document.getElementById('punishments-table-body');
  const countBadge = document.getElementById('punishments-count');
  if (!tbody) return;

  if (countBadge) countBadge.textContent = items.length;

  if (!items || items.length === 0) {
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
      case 'KICK':
        return '<span class="px-2 py-0.5 rounded text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">KICK</span>';
      case 'JAIL':
        return '<span class="px-2 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">JAIL</span>';
      default:
        return `<span class="px-2 py-0.5 rounded text-xs font-bold bg-slate-700 text-slate-300">${type}</span>`;
    }
  };

  tbody.innerHTML = items.map(p => {
    const formattedDate = new Date(p.createdAt).toLocaleDateString('uz-UZ', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });

    return `
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
        <td class="py-3 px-4 text-slate-300 max-w-xs truncate" title="${p.reason}">
          ${p.reason}
        </td>
        <td class="py-3 px-4 text-slate-400 text-xs">
          <span class="text-amber-400/90 font-semibold">🛡️ ${p.operator || 'Admin'}</span>
        </td>
        <td class="py-3 px-4 text-slate-300 font-mono text-xs">
          ${p.duration}
        </td>
        <td class="py-3 px-4">
          ${p.active !== false 
            ? '<span class="inline-flex items-center gap-1 text-xs text-red-400 font-semibold"><span class="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>Faol</span>' 
            : '<span class="text-xs text-slate-500 font-medium">Tugagan</span>'}
        </td>
      </tr>
    `;
  }).join('');
}

// ----------------------------------------------------
// Modals & User Interaction
// ----------------------------------------------------
function openLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) modal.classList.add('hidden');
}

function openRankPurchaseModal(rankId) {
  const rank = allRanks.find(r => r.id === rankId);
  if (!rank) return;

  const modal = document.getElementById('purchase-modal');
  const title = document.getElementById('purchase-modal-title');
  const details = document.getElementById('purchase-modal-details');

  title.innerHTML = `${rank.badge} ${rank.name} Rankini Sotib Olish`;

  // Default prefilled nick from current logged in user if any
  const prefilledNick = currentUser ? currentUser.nickname : '';

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
        <div class="relative">
          <input 
            type="text" 
            id="buy-player-nick" 
            placeholder="Masalan: ${prefilledNick || 'Sherzod_Pro'}" 
            value="${prefilledNick}"
            class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono focus:border-amber-400 focus:outline-none"
          />
        </div>
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
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
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

  const tgUrl = `https://t.me/FrokaMC?text=${encodeURIComponent(text)}`;
  window.open(tgUrl, '_blank');
  closePurchaseModal();
  showToast('Telegramga yo\'naltirilmoqda...', 'success');
}

function closePurchaseModal() {
  const modal = document.getElementById('purchase-modal');
  if (modal) modal.classList.add('hidden');
}

// Image Zoom Modal
function openImageModal(imgSrc, title) {
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-zoomed-image');
  const modalTitle = document.getElementById('image-modal-title');
  if (modal && modalImg) {
    modalImg.src = imgSrc;
    if (modalTitle) modalTitle.textContent = title;
    modal.classList.remove('hidden');
  }
}

function closeImageModal() {
  const modal = document.getElementById('image-modal');
  if (modal) modal.classList.add('hidden');
}

// ----------------------------------------------------
// Event Listeners Initialization
// ----------------------------------------------------
function initEventListeners() {
  // Copy IP buttons
  const copyBtn = document.getElementById('btn-copy-ip');
  if (copyBtn) copyBtn.addEventListener('click', copyServerIP);

  const heroCopyBtn = document.getElementById('hero-copy-ip-btn');
  if (heroCopyBtn) heroCopyBtn.addEventListener('click', copyServerIP);

  // Close modals on clicking overlay
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.add('hidden');
      }
    });
  });

  // Login form handler
  const loginForm = document.getElementById('user-login-form');
  const nickInput = document.getElementById('login-nickname');
  const skinPreview = document.getElementById('login-skin-preview');

  if (nickInput && skinPreview) {
    nickInput.addEventListener('input', () => {
      const val = nickInput.value.trim();
      if (val.length >= 3) {
        skinPreview.src = getSkinAvatarUrl(val, 64);
      } else {
        skinPreview.src = 'https://mc-heads.net/avatar/steve/64';
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nickname = nickInput.value.trim();
      const password = document.getElementById('login-password').value;

      if (!nickname || !password) {
        showToast('Nik va parolni to\'liq kiriting!', 'error');
        return;
      }

      try {
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Tekshirilmoqda...</span>`;

        const res = await fetch(`${CONFIG.API_BASE_URL}/auth/login-or-register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nickname, password })
        });

        const data = await res.json();
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Kirish</span>`;

        if (data.success) {
          localStorage.setItem('frokamc_token', data.token);
          localStorage.setItem('frokamc_user', JSON.stringify(data.user));
          currentUser = data.user;
          renderUserAuthUI();
          closeLoginModal();
          showToast(data.message, 'success');
        } else {
          showToast(data.message || 'Xatolik yuz berdi', 'error');
        }
      } catch (err) {
        console.error('Login error:', err);
        showToast('Serverga ulanib bo\'lmadi. Backend ishga tushirilganmi?', 'error');
      }
    });
  }

  // Punishments filter buttons
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

  // Punishments search input
  const punishSearchInput = document.getElementById('punish-search-input');
  if (punishSearchInput) {
    let debounceTimer;
    punishSearchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const activeBtn = document.querySelector('.punish-filter-btn.bg-amber-500');
        const type = activeBtn ? activeBtn.getAttribute('data-type') : 'ALL';
        fetchPunishments(type, punishSearchInput.value);
      }, 300);
    });
  }
}
