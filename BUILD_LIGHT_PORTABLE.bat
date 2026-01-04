@echo off
cls
color 0B
title Light ERP - One-Click Portable Builder

echo.
echo ========================================================
echo.
echo           LIGHT ERP - PORTABLE BUILDER
echo           Create Standalone Package
echo.
echo ========================================================
echo.
echo This will create a portable version of Light ERP that
echo anyone can use without installing Python or Node.js
echo.
echo Prerequisites (needed on THIS computer only):
echo   - Python 3.11 or later
echo   - Node.js 18 or later
echo.
echo End users will NOT need these!
echo.
echo ========================================================
echo.
pause

echo.
echo Starting build process...
echo.

cd light

if not exist "BUILD_COMPLETE.ps1" (
    echo ERROR: BUILD_COMPLETE.ps1 not found!
    echo Please make sure you're running this from the MG-ERP directory
    pause
    exit /b 1
)

powershell -ExecutionPolicy Bypass -File BUILD_COMPLETE.ps1

echo.
echo ========================================================
echo.
echo Build complete! Check the light/dist folder
echo.
pause
