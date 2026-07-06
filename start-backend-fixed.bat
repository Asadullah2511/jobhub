@echo off
echo ========================================
echo   JobHub Backend Server (Fixed)
echo ========================================
echo.
echo Checking for port conflicts...
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :5000') DO (
    echo Killing process on port 5000 (PID: %%P)
    taskkill /PID %%P /F >nul 2>&1
)
echo Port 5000 is clear!
echo.
echo Starting backend server...
echo.
cd JobNova-main\backend
npm run dev
