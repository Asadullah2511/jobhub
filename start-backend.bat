@echo off
echo ========================================
echo   Starting JobHub Backend Server
echo ========================================
echo.

cd JobNova-main\backend

echo Checking Node.js...
node --version
echo.

echo Starting server...
echo Press Ctrl+C to stop
echo.

npm start
