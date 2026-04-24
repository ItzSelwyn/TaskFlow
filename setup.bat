@echo off
echo ============================================================
echo  TaskFlow - Windows Dev Setup
echo ============================================================

REM Check Node
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Install from https://nodejs.org
    pause & exit /b 1
)

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm not found.
    pause & exit /b 1
)

echo.
echo [1/4] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 ( echo ERROR: Backend install failed & pause & exit /b 1 )

echo.
echo [2/4] Installing frontend dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 ( echo ERROR: Frontend install failed & pause & exit /b 1 )
cd ..

echo.
echo [3/4] Setting up backend .env ...
if not exist backend\.env (
    copy backend\.env.example backend\.env
    echo Created backend\.env from example. Edit it with your values.
) else (
    echo backend\.env already exists, skipping.
)

echo.
echo [4/4] Setting up root .env ...
if not exist .env (
    copy .env.example .env
    echo Created .env from example. Edit it with your values.
) else (
    echo .env already exists, skipping.
)

echo.
echo ============================================================
echo  Setup complete!
echo.
echo  Next steps:
echo    1. Make sure PostgreSQL and Redis are running locally
echo       OR use: docker-compose up postgres redis -d
echo    2. Edit backend\.env with your DATABASE_URL etc.
echo    3. Run: setup-db.bat
echo    4. Run: dev.bat  (starts both servers)
echo ============================================================
pause
