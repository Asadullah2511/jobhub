@echo off
title Expo Server
color 0A
cls
echo.
echo ========================================
echo    EXPO SERVER - Starting...
echo ========================================
echo.
echo Killing old Metro processes on port 8081...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081') do taskkill /F /PID %%a 2>nul
timeout /t 2 /nobreak >nul
echo.
cd JobHubMobile-Expo
npx expo start --port 8081
