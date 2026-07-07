@echo off
echo ========================================
echo   JobHub - Starting All Servers
echo ========================================
echo.

echo [1/5] Killing any existing Node processes...
powershell -Command "Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force" >nul 2>&1
timeout /t 2 /nobreak >nul
echo Done!

echo [2/5] Clearing ports...
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') DO (
    taskkill /PID %%P /F >nul 2>&1
)
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :8081 ^| findstr LISTENING') DO (
    taskkill /PID %%P /F >nul 2>&1
)
echo Done!

echo [3/5] Clearing Expo cache...
cd JobHubMobile-Expo
if exist .expo rmdir /s /q .expo >nul 2>&1
if exist node_modules\.cache rmdir /s /q node_modules\.cache >nul 2>&1
echo Done!

echo [4/5] Starting Backend (Port 5000)...
cd ..\JobNova-main\backend
start "JobHub Backend" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul
echo Done!

echo [5/5] Starting Expo...
cd ..\..\JobHubMobile-Expo
start "JobHub Expo" cmd /k "npx expo start --clear"
echo Done!

echo.
echo ========================================
echo   Both servers started!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Expo: Check new window for QR code
echo.
echo Connect phone to: exp://192.168.0.107:8081
echo (If port conflict, use 8082)
echo.
echo WAIT 30 seconds for bundle to build!
echo.
pause
