@echo off
echo ==========================================
echo Starting Smart City Decision Hub Platform
echo ==========================================
echo.

echo Launching Express backend server...
start "Smart City Backend" cmd /k "cd server && npm run dev"

echo Launching React/Vite frontend server...
npm.cmd run dev

pause
