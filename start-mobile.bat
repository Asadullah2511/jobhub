@echo off
echo ========================================
echo   Starting JobHub Mobile App (Expo)
echo ========================================
echo.

cd JobHubMobile-Expo

echo Checking Expo CLI...
npx expo --version
echo.

echo Starting Expo dev server...
echo Scan QR code with Expo Go app
echo Press Ctrl+C to stop
echo.

npx expo start
