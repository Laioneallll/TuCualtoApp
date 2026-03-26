@echo off
REM Build validation script for Tu Cualto App
cd /d "C:\Users\laion\OneDrive\Escritorio\Tareas\Tucualto\TuCualtoApp"

echo ====================================
echo Step 1: Installing Dependencies
echo ====================================
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    exit /b 1
)

echo.
echo ====================================
echo Step 2: Building Project
echo ====================================
call npm run build
if errorlevel 1 (
    echo ERROR: npm run build failed
    exit /b 1
)

echo.
echo ====================================
echo Build Validation Complete
echo ====================================
echo All steps completed successfully!
pause
