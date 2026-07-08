@echo off
echo ========================================
echo   Starting JobHub - Full Stack
echo ========================================
echo.

echo Opening Backend in new window...
start "JobHub Backend" cmd /k "cd JobNova-main\backend && npm start"

timeout /t 3 /nobreak > nul

echo Opening Mobile App in new window...
start "JobHub Mobile" cmd /k "cd JobHubMobile-Expo && npx expo start"

echo.
echo ========================================
echo   Both servers are starting!
echo ========================================
echo.
echo Backend: http://localhost:5000/api
echo Mobile: Scan QR code in Expo window
echo.
echo Press any key to exit this window...
pause > nul
