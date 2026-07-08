@echo off
title JobHub - Auto-Fix Monitor
color 0A
cls

echo ========================================
echo   JOBHUB AUTO-FIX ERROR MONITOR
echo ========================================
echo.
echo Starting servers with auto-fix monitoring...
echo.

REM Kill any existing processes
echo Killing old processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting Backend Server...
start "Backend" cmd /c "cd JobNova-main\backend && npm run dev"
timeout /t 5 /nobreak >nul

echo Starting Expo Metro Bundler...
start "Metro" cmd /c "cd JobHubMobile-Expo && npx expo start --port 8081 --clear"

echo.
echo ========================================
echo   SERVERS STARTED
echo ========================================
echo.
echo Backend:  http://192.168.1.126:5000
echo Metro:    http://192.168.1.126:8081
echo.
echo Connect your phone to:
echo exp://192.168.1.126:8081
echo.
echo ========================================
echo.
echo Monitoring for errors...
echo Press Ctrl+C to stop
echo.

REM Monitor loop
:MONITOR
timeout /t 5 /nobreak >nul

REM Check if Metro is running
netstat -ano | findstr :8081 | findstr LISTENING >nul
if errorlevel 1 (
    echo.
    echo [ERROR] Metro stopped! Restarting...
    start "Metro" cmd /c "cd JobHubMobile-Expo && npx expo start --port 8081"
)

REM Check if Backend is running
netstat -ano | findstr :5000 | findstr LISTENING >nul
if errorlevel 1 (
    echo.
    echo [ERROR] Backend stopped! Restarting...
    start "Backend" cmd /c "cd JobNova-main\backend && npm run dev"
)

goto MONITOR
