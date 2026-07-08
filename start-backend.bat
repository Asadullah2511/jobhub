@echo off
title Backend Server
color 0B
cls
echo.
echo ========================================
echo    BACKEND SERVER - Starting...
echo ========================================
echo.
echo Killing old processes on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do taskkill /F /PID %%a 2>nul
timeout /t 2 /nobreak >nul
echo.
cd JobNova-main\backend
npm run dev
