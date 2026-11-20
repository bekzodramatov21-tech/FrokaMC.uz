# 🎮 FrokaMC.uz — Rasmiy Minecraft Server Web Portali

FrokaMC.uz Minecraft serveri uchun yaratilgan to'liq (Full-Stack), zamonaviy, tezkor va avtomatlashtirilgan veb-sayt.

---

## 🌟 Asosiy Imkoniyatlar

1. **Kirish & Ro'yxatdan O'tish (Auth):**
   - O'yinchi o'z Minecraft niki va paroli bilan kiradi.
   - Birinchi marta kirganda kiritilgan parol bilan avtomatik yangi hisob ochiladi.
   - Doimiy sessiya (`localStorage` orqali eslab qolinadi, foydalanuvchi "Chiqish" tugmasini bosmaguncha qayta kiritish shart emas).
   - Minecraft Skin boshini real vaqt rejimida avtomatik render qiladi (`https://mc-heads.net/avatar/{nick}`).

2. **Server Taqdimoti & Maqto'v (Hero Section):**
   - FrokaMC serverining afzalliklari: O'zbekistonning #1 loyihasi, minimal ping (<20ms), 0% lag, 100% Anti-Cheat, kuchli iqtisodiyot va PvP.
   - Bir bosishda Server IP manzilini (`play.frokamc.uz`) nusxalash tugmasi.
   - Jonli onlayn o'yinchilar soni va server holati ko'rsatkichi.

3. **Ranklar & Donat (9 ta Rank):**
   - 🟠 **IMPERATOR** — 49.000 so'm (30 kun) / 128.000 so'm (Umrbot)
   - ⚡️ **GENERAL** — 38.000 so'm (30 kun) / 98.000 so'm (Umrbot)
   - 🩵 **AFSONA** — 29.000 so'm (30 kun) / 76.000 so'm (Umrbot)
   - 💞 **ELITA** — 21.000 so'm (30 kun) / 57.000 so'm (Umrbot)
   - 🚩 **TITAN** — 16.000 so'm (30 kun) / 43.000 so'm (Umrbot)
   - ✨ **ALPOMISH** — 14.000 so'm (30 kun) / 29.000 so'm (Umrbot)
   - 💥 **RITSAR** — 10.000 so'm (30 kun) / 21.000 so'm (Umrbot)
   - 🔥 **QAHRAMON** — 6.000 so'm (30 kun) / 14.000 so'm (Umrbot)
   - 💱 **ASKAR** — 4.000 so'm (30 kun) / 9.000 so'm (Umrbot)
   - Har bir rank uchun to'liq buyruqlar (`/kit`, `/fly`, `/near`, `/invsee` va boshqalar) va imkoniyatlar (Enderchest, Homelar soni, RG bloklar soni, Auksion slotlari, Teleport kutish soniyasi).
   - Telegram [@FrokaMC](https://t.me/FrokaMC) orqali xarid qilish: barcha ma'lumotlar bilan tayyor xabarni 1 klikda Telegramga yuborish.
   - Rank rasmlarini kattalashtirib ko'rish modali.

4. **PvP Tierlist:**
   - Serverning eng kuchli PvP ustalari reytingi.
   - **Faqat Admin paneli orqali boshqariladi** (Admin yangi o'yinchini qo'shadi, tier darajasini belgilaydi, ELO, K/D va o'yin uslubini kiritadi).
   - Har bir o'yinchining Minecraft skini avtomatik ko'rsatiladi.

5. **Jazolar Ro'yxati (Punishments / Banlist):**
   - Serverda jazo olgan qoidabuzarlar (Ban, Mute, Kick, Jail) shaffof ro'yxati.
   - **Faqat Admin paneli orqali post qilinadi va boshqariladi**.
   - Qidiruv (nik yoki sabab bo'yicha) va turlar bo'yicha saralash.
   - Jazo muddati, sababi, bergan admin va holati (Faol / Tugagan).

6. **Admin Dashboard (`/admin.html`):**
   - 2 ta standart admin akkaunti tayyor:
     * **1-Admin:** `admin` / `admin123` (Superadmin)
     * **2-Admin:** `moderator` / `moder123` (Moderator)
   - **Gmail ulash va Parol o'zgartirish:** Admin o'z shaxsiy Gmail pochtasini ulab, parolini istalgan vaqtda yangilay oladi!
   - Tierlist o'yinchilarini qo'shish, tahrirlash, o'chirish.
   - Qoidabuzarlarga jazo belgilash, unban/unmute qilish, o'chirish.
   - Ro'yxatdan o'tgan o'yinchilar ro'yxatini ko'rish.

---

## 📁 Loyiha Strukturasi

```
Frokamc.uz/
├── back/                      # Backend API (Node.js + Express)
│   ├── data/                  # Xavfsiz JSON Database (Faylli ma'lumotlar bazasi)
│   │   ├── admins.json        # Admin hisoblari (Gmail va parollar)
│   │   ├── users.json         # Ro'yxatdan o'tgan o'yinchilar
│   │   ├── tierlist.json      # PvP Tierlist ro'yxati
│   │   ├── punishments.json   # Jazolar ro'yxati
│   │   ├── ranks.json         # Barcha 9 ta rank narxlari va buyruqlari
│   │   └── serverinfo.json    # Server tavsifi, IP va status
│   ├── middleware/
│   │   └── auth.js            # JWT & Admin xavfsizlik filtrlari
│   ├── routes/
│   │   ├── admin.js           # Admin profili, sozlamalar va statistika
│   │   ├── auth.js            # Login/Register o'yinchi va admin
│   │   ├── punishments.js     # Jazolar API
│   │   ├── ranks.js           # Ranklar API
│   │   ├── server.js          # Server status API
│   │   └── tierlist.js        # PvP Tierlist API
│   ├── package.json
│   ├── server.js              # Asosiy Express server (ham API, ham frontendni beradi)
│   └── storage.js             # Atomik xavfsiz fayl yozish va parollarni shifrlash
├── front/                     # Frontend (Zamonaviy Dark Cyber Minecraft UI)
│   ├── assets/
│   │   └── images/            # Logo (FMC) va barcha 9 ta rank skrinshotlari
│   ├── css/
│   │   └── style.css          # Custom Minecraft pixel dizayn va animatsiyalar
│   ├── js/
│   │   ├── admin.js           # Admin panel boshqaruvi
│   │   ├── app.js             # Asosiy sayt logikasi (Auth, Ranklar, Tierlist, Banlist)
│   │   └── config.js          # API va server havolalari konfiguratsiyasi
│   ├── admin.html             # Admin Panel sahifasi
│   └── index.html             # Asosiy Web Portal sahifasi
├── start.bat                  # Windowsda 1 bosishda ishga tushirish skripti
└── README.md                  # Loyiha qo'llanmasi
```

---

## 🚀 Qanday Ishga Tushiriladi? (Lokal)

### 1-usul: `start.bat` orqali (Eng oson)
Faqat papkadagi `start.bat` fayliga 2 marta bosing!
U avtomatik ravishda kutubxonalarni o'rnatadi, serverni yoqadi va brauzerda `http://localhost:5000` ni ochadi.

### 2-usul: Terminal orqali
```bash
cd back
npm install
node server.js
```
Sayt manzillari:
- **Asosiy Sayt:** [http://localhost:5000](http://localhost:5000)
- **Admin Panel:** [http://localhost:5000/admin.html](http://localhost:5000/admin.html)

---

## 🌐 Saytni 100% Tekinga Internetga Joylash (Deploy)

Loyiha hech qanday murakkab tashqi MB talab qilmaydi, shuning uchun uni 100% tekinga internetga chiqarish mumkin:

### Usul: Render.com (100% Tekin Web Service)
1. Kodni GitHub profilingizga yuklang (repo yarating).
2. [Render.com](https://render.com) ga kiring va "New +" -> "Web Service" tugmasini bosing.
3. GitHub reponi tanlang:
   - **Root Directory:** `back`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Free (Tekin)
4. "Create Web Service" tugmasini bosing. 2 daqiqada sizga tekin `https://frokamc.onrender.com` domeni beriladi! Backend ham frontni o'zi taqdim etadi.
5. Keyin `frokamc.uz` domenini Renderga ulab qo'yishingiz mumkin!

---

## 🔐 Admin Hisoblari

| Foydalanuvchi | Parol | Roli | Vazifasi |
|---|---|---|---|
| `admin` | `admin123` | Bosh Administrator | Tizimni to'liq boshqarish |
| `moderator` | `moder123` | Moderator | Tierlist va jazolarni yuritish |

> 💡 **Muhim:** Admin panelga kirib (`/admin.html`), "Gmail & Parol Sozlamasi" bo'limidan o'z Gmail pochtangizni ulab, parollarni o'zgartirib olishingiz mumkin.
