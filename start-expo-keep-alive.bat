@echo off
title Expo Server - Keep Alive
color 0A
cls
echo.
echo ========================================
echo    EXPO SERVER - SDK 54
echo ========================================
echo.

:START
echo Killing old processes on port 8081...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081') do taskkill /F /PID %%a 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting Expo Metro Bundler...
echo.
cd JobHubMobile-Expo
npx expo start --port 8081 --clear

echo.
echo Metro stopped. Restarting in 3 seconds...
timeout /t 3 /nobreak >nul
goto START
