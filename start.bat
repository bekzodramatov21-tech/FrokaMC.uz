@echo off
title FrokaMC.uz Web Server
color 0b

echo ========================================================
echo        FrokaMC.uz Minecraft Web Loyihasi
echo ========================================================
echo.

cd /d "%~dp0back"

if not exist "node_modules" (
    echo [1/3] Kutubxonalar o'rnatilmoqda (npm install)...
    call npm install
)

echo [2/3] Brauzerda sayt ochilmoqda: http://localhost:5000
start "" "http://localhost:5000"

echo [3/3] Backend server ishga tushirilmoqda...
echo.
echo Admin panel: http://localhost:5000/admin.html
echo Standart Adminlar: admin / admin123  va  moderator / moder123
echo Serverni to'xtatish uchun: Ctrl + C bosing.
echo ========================================================
echo.

call node server.js
pause
