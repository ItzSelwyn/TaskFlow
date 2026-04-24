@echo off
echo ============================================================
echo  TaskFlow - Docker (Production)
echo ============================================================

docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker not found. Install Docker Desktop from https://docker.com
    pause & exit /b 1
)

if not exist .env (
    copy .env.example .env
    echo Created .env - please edit it then re-run this script.
    notepad .env
    pause & exit /b 0
)

echo.
echo Building and starting all services...
docker-compose up --build -d

if %errorlevel% neq 0 (
    echo ERROR: Docker compose failed.
    pause & exit /b 1
)

echo.
echo Waiting for database to be ready...
timeout /t 8 /nobreak >nul

echo.
echo Running migrations inside container...
docker-compose exec api npx prisma migrate deploy

echo.
echo Seeding database...
docker-compose exec api npx ts-node prisma/seed.ts

echo.
echo ============================================================
echo  TaskFlow is running!
echo.
echo  App      -> http://localhost
echo  API      -> http://localhost:4000
echo  DB Admin -> docker-compose exec postgres psql -U taskflow
echo.
echo  Seed accounts:
echo    alice@acme.com   / password123
echo    bob@acme.com     / password123
echo    carol@globex.com / password123
echo.
echo  To stop: docker-compose down
echo  Logs:    docker-compose logs -f
echo ============================================================
pause
