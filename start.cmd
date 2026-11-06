@echo off
cd /d "%~dp0"
if not exist "node_modules\vite\bin\vite.js" (
  echo Install dependencies first: npm ci
  pause
  exit /b 1
)
call npm run dev -- --open
pause
