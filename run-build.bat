@echo off
setlocal enabledelayedexpansion

cd /d "C:\Users\laion\OneDrive\Escritorio\Tareas\Tucualto\TuCualtoApp"

echo ============================================
echo RUNNING: npm install
echo ============================================
call npm install
set INSTALL_STATUS=%ERRORLEVEL%

echo.
echo ============================================
echo RUNNING: npm run build
echo ============================================
call npm run build
set BUILD_STATUS=%ERRORLEVEL%

echo.
echo Install exit code: %INSTALL_STATUS%
echo Build exit code: %BUILD_STATUS%

exit /b %BUILD_STATUS%
