# Light ERP - Complete Build Script
# This is the ONLY script you need to run!
# It builds everything and creates a ready-to-distribute package

Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                ║" -ForegroundColor Cyan
Write-Host "║     Light ERP - Complete Build System         ║" -ForegroundColor Cyan
Write-Host "║     One-Click Build for Non-Technical Users   ║" -ForegroundColor Cyan
Write-Host "║                                                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Function to show progress
function Show-Progress {
    param([string]$Step, [string]$Status, [string]$Color = "Yellow")
    Write-Host ""
    Write-Host "[$Step] $Status" -ForegroundColor $Color
    Write-Host ("─" * 50) -ForegroundColor Gray
}

# Check prerequisites
Show-Progress "CHECK" "Verifying prerequisites..." "Cyan"

$hasErrors = $false

# Check Python
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonVersion = python --version
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Python not found! Please install Python 3.11+" -ForegroundColor Red
    $hasErrors = $true
}

# Check Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found! Please install Node.js 18+" -ForegroundColor Red
    $hasErrors = $true
}

# Check npm
if (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "✓ npm found" -ForegroundColor Green
} else {
    Write-Host "✗ npm not found!" -ForegroundColor Red
    $hasErrors = $true
}

if ($hasErrors) {
    Write-Host ""
    Write-Host "ERROR: Missing prerequisites. Please install them first." -ForegroundColor Red
    Write-Host "Visit: https://www.python.org and https://nodejs.org" -ForegroundColor Yellow
    pause
    exit 1
}

# Ask user to continue
Write-Host ""
Write-Host "This will:" -ForegroundColor White
Write-Host "  1. Build the React frontend" -ForegroundColor White
Write-Host "  2. Package the backend as executable" -ForegroundColor White
Write-Host "  3. Create launcher and installer" -ForegroundColor White
Write-Host "  4. Generate distributable package" -ForegroundColor White
Write-Host ""
Write-Host "Time estimate: 5-10 minutes" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Continue? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "Build cancelled." -ForegroundColor Yellow
    exit 0
}

# Step 1: Build Frontend
Show-Progress "1/5" "Building Frontend..." "Green"

$frontendDir = Join-Path $scriptDir "frontend"
Set-Location $frontendDir

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies (this may take a few minutes)..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Frontend dependency installation failed!" -ForegroundColor Red
        pause
        exit 1
    }
}

Write-Host "Building React application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Frontend build failed!" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "✓ Frontend built successfully!" -ForegroundColor Green

# Step 2: Setup Backend
Show-Progress "2/5" "Setting up Backend..." "Green"

$backendDir = Join-Path $scriptDir "backend"
Set-Location $backendDir

# Create venv if doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to create virtual environment!" -ForegroundColor Red
        pause
        exit 1
    }
}

# Activate venv
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Install dependencies
Write-Host "Installing Python dependencies (this may take a few minutes)..." -ForegroundColor Yellow
pip install --upgrade pip
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Backend dependency installation failed!" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "✓ Backend setup complete!" -ForegroundColor Green

# Step 3: Create Executable
Show-Progress "3/5" "Creating Executable..." "Green"

Write-Host "Running PyInstaller (this will take several minutes)..." -ForegroundColor Yellow
pyinstaller light_erp.spec --clean
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Executable creation failed!" -ForegroundColor Red
    pause
    exit 1
}

if (-not (Test-Path "dist\LightERP.exe")) {
    Write-Host "✗ Executable not found after build!" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "✓ Executable created successfully!" -ForegroundColor Green

# Step 4: Create Distribution Package
Show-Progress "4/5" "Creating Distribution Package..." "Green"

Set-Location $scriptDir
$distDir = Join-Path $scriptDir "dist"
$packageDir = Join-Path $distDir "LightERP"

# Clean previous
if (Test-Path $distDir) {
    Remove-Item -Path $distDir -Recurse -Force
}
New-Item -ItemType Directory -Path $packageDir -Force | Out-Null

Write-Host "Copying files..." -ForegroundColor Yellow

# Copy executable
Copy-Item (Join-Path $backendDir "dist\LightERP.exe") -Destination $packageDir

# Copy frontend
$frontendDistSource = Join-Path $frontendDir "dist"
$frontendDistDest = Join-Path $packageDir "frontend"
New-Item -ItemType Directory -Path $frontendDistDest -Force | Out-Null
Copy-Item -Path "$frontendDistSource\*" -Destination $frontendDistDest -Recurse

# Copy sample data script
Copy-Item (Join-Path $backendDir "add_sample_data.py") -Destination $packageDir

# Copy launcher
Copy-Item (Join-Path $scriptDir "launcher.py") -Destination $packageDir

# Create launcher executable
Write-Host "Creating launcher executable..." -ForegroundColor Yellow
Set-Location $packageDir
& "$backendDir\venv\Scripts\Activate.ps1"
pyinstaller --onefile --windowed --name="LightERP_Launcher" launcher.py --clean --distpath . --workpath temp --specpath temp
Remove-Item -Path "temp" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "launcher.py" -Force -ErrorAction SilentlyContinue

# Create batch launcher
$batchLauncher = @"
@echo off
title Light ERP Module
cls
echo.
echo ================================================
echo   Light ERP Module
echo   Starting application...
echo ================================================
echo.
echo The application will open in your browser
echo at http://localhost:8005
echo.
echo Press Ctrl+C to stop the server
echo.
start http://localhost:8005
timeout /t 3 /nobreak >nul
LightERP.exe
pause
"@
Set-Content -Path "Start_LightERP.bat" -Value $batchLauncher

# Create README
$readme = @"
╔════════════════════════════════════════════════╗
║                                                ║
║         LIGHT ERP - QUICK START                ║
║                                                ║
╚════════════════════════════════════════════════╝

GETTING STARTED:
================

1. Double-click: LightERP_Launcher.exe
2. Click "Start Application"
3. Browser opens automatically
4. Start using Light ERP!

WHAT'S INCLUDED:
================
✓ Point of Sale (POS)
✓ Inventory Management  
✓ Financial Ledger
✓ Reports & Analytics
✓ Sample Data

YOUR DATA:
==========
Your data is stored in: light_erp.db

IMPORTANT: Backup this file regularly!

HOW TO BACKUP:
- Close the application
- Copy light_erp.db to a safe location
- That's it!

TROUBLESHOOTING:
================

Browser doesn't open?
→ Open browser and go to: http://localhost:8005

Application won't start?
→ Make sure port 8005 is not used by another program
→ Try restarting your computer

Need help?
→ See USER_GUIDE.md for detailed instructions
→ See VISUAL_GUIDE.md for picture guide

SYSTEM REQUIREMENTS:
====================
- Windows 7 or later
- 2 GB RAM
- 100 MB disk space
- No internet required

═══════════════════════════════════════════════

Light ERP Module v1.0.0 - Portable Edition
No installation. No internet. No complexity.

═══════════════════════════════════════════════
"@
Set-Content -Path "README.txt" -Value $readme

Write-Host "✓ Package structure created!" -ForegroundColor Green

# Step 5: Create ZIP
Show-Progress "5/5" "Creating ZIP Archive..." "Green"

Set-Location $distDir
$zipName = "LightERP_Portable_v1.0.0_$(Get-Date -Format 'yyyyMMdd').zip"

Write-Host "Compressing files..." -ForegroundColor Yellow
Compress-Archive -Path "LightERP" -DestinationPath $zipName -Force

Write-Host "✓ ZIP archive created!" -ForegroundColor Green

# Copy guides
Write-Host "Copying user guides..." -ForegroundColor Yellow
Copy-Item (Join-Path $scriptDir "USER_GUIDE.md") -Destination $distDir
Copy-Item (Join-Path $scriptDir "VISUAL_GUIDE.md") -Destination $distDir

# Final Summary
Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                ║" -ForegroundColor Green
Write-Host "║           BUILD COMPLETE! 🎉                   ║" -ForegroundColor Green
Write-Host "║                                                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Distribution Location:" -ForegroundColor White
Write-Host "   $distDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "📦 Ready to distribute:" -ForegroundColor White
Write-Host "   ✓ LightERP folder (ready to use)" -ForegroundColor Green
Write-Host "   ✓ $zipName (ready to share)" -ForegroundColor Green
Write-Host ""
Write-Host "📄 User documentation:" -ForegroundColor White
Write-Host "   ✓ USER_GUIDE.md (comprehensive guide)" -ForegroundColor Green
Write-Host "   ✓ VISUAL_GUIDE.md (picture guide)" -ForegroundColor Green
Write-Host "   ✓ README.txt (quick start)" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 What to share with users:" -ForegroundColor Yellow
Write-Host "   1. Share the ZIP file" -ForegroundColor White
Write-Host "   2. Tell them to extract it" -ForegroundColor White
Write-Host "   3. Tell them to double-click LightERP_Launcher.exe" -ForegroundColor White
Write-Host "   4. That's it!" -ForegroundColor White
Write-Host ""
Write-Host "✨ Test it yourself:" -ForegroundColor Yellow
Write-Host "   cd '$packageDir'" -ForegroundColor Cyan
Write-Host "   .\LightERP_Launcher.exe" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to open the distribution folder..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open the folder
Start-Process explorer.exe -ArgumentList $distDir

Set-Location $scriptDir
