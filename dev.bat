@echo off
echo ============================================================
echo  TaskFlow - Starting Dev Servers
echo ============================================================
echo.
echo  Backend  -> http://localhost:4000
echo  Frontend -> http://localhost:5173
echo.
echo  Press Ctrl+C in each window to stop.
echo ============================================================

REM Start backend in new window
start "TaskFlow API" cmd /k "cd backend && npm run dev"

REM Wait a moment then start frontend
timeout /t 2 /nobreak >nul
start "TaskFlow Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers starting in separate windows.
echo Open http://localhost:5173 in your browser.
pause
