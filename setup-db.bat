@echo off
echo ============================================================
echo  TaskFlow - Database Setup
echo ============================================================

cd backend

echo.
echo [1/3] Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 ( echo ERROR: Prisma generate failed & pause & exit /b 1 )

echo.
echo [2/3] Running migrations...
call npx prisma migrate dev --name init
if %errorlevel% neq 0 ( echo ERROR: Migration failed. Is PostgreSQL running? & pause & exit /b 1 )

echo.
echo [3/3] Seeding database...
call npx ts-node prisma/seed.ts
if %errorlevel% neq 0 ( echo WARNING: Seed failed, continuing anyway... )

cd ..

echo.
echo ============================================================
echo  Database ready!
echo.
echo  Seed accounts:
echo    alice@acme.com  / password123  (admin, Acme Corp)
echo    bob@acme.com    / password123  (member, Acme Corp)
echo    carol@globex.com/ password123  (admin, Globex Inc)
echo ============================================================
pause
