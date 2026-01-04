# Light ERP - Build and Package Script
# This script builds the frontend and packages everything into a distributable

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Light ERP Module - Build & Package" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $scriptDir "backend"
$frontendDir = Join-Path $scriptDir "frontend"
$distDir = Join-Path $scriptDir "dist"

# Clean previous builds
Write-Host "Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path $distDir) {
    Remove-Item -Path $distDir -Recurse -Force
}
New-Item -ItemType Directory -Path $distDir -Force | Out-Null

# Step 1: Build Frontend
Write-Host ""
Write-Host "Step 1: Building Frontend..." -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray

Set-Location $frontendDir

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Building React app..." -ForegroundColor Yellow
npm run build

if (-not (Test-Path "dist")) {
    Write-Host "ERROR: Frontend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Frontend built successfully" -ForegroundColor Green

# Step 2: Install Backend Dependencies
Write-Host ""
Write-Host "Step 2: Preparing Backend..." -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray

Set-Location $backendDir

# Create/activate virtual environment
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Install dependencies including PyInstaller
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt
pip install pyinstaller

Write-Host "Backend dependencies installed" -ForegroundColor Green

# Step 3: Package with PyInstaller
Write-Host ""
Write-Host "Step 3: Creating Executable..." -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray

Write-Host "Running PyInstaller..." -ForegroundColor Yellow
pyinstaller light_erp.spec --clean --noconfirm

if (-not (Test-Path "dist\LightERP.exe")) {
    Write-Host "ERROR: Executable creation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Executable created successfully" -ForegroundColor Green

# Step 4: Copy Files to Distribution Directory
Write-Host ""
Write-Host "Step 4: Creating Distribution Package..." -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray

$packageDir = Join-Path $distDir "LightERP"
New-Item -ItemType Directory -Path $packageDir -Force | Out-Null

# Copy executable
Write-Host "Copying executable..." -ForegroundColor Yellow
Copy-Item "dist\LightERP.exe" -Destination $packageDir

# Copy frontend build
Write-Host "Copying frontend files..." -ForegroundColor Yellow
$frontendDistSource = Join-Path $frontendDir "dist"
$frontendDistDest = Join-Path $packageDir "frontend\dist"
New-Item -ItemType Directory -Path (Join-Path $packageDir "frontend") -Force | Out-Null
Copy-Item -Path $frontendDistSource -Destination (Join-Path $packageDir "frontend") -Recurse

# Copy database initialization scripts
Write-Host "Copying initialization files..." -ForegroundColor Yellow
Copy-Item "init_database.py" -Destination $packageDir
Copy-Item "add_sample_data.py" -Destination $packageDir

# Create README for users
Set-Location $scriptDir
Write-Host "Creating user documentation..." -ForegroundColor Yellow
$userReadme = @'
Light ERP Module - Portable Version

Quick Start Guide

First Time Setup:
Step 1: Double-click Start_LightERP.bat
Step 2: Wait for browser to open automatically
Step 3: Login with default credentials below

Default Login Credentials:
Admin: username admin / password admin123 - Full access
Manager: username manager / password manager123 - Most features
Cashier: username cashier / password cashier123 - POS only

WARNING: Change passwords after first login!

What is Included:
* Secure user authentication with 3 roles
* Complete POS system with sales user tracking
* Inventory management with barcode support
* Expense tracking
* Sales user management
* Financial ledger
* Reports and analytics
* Sample data included

System Requirements:
* Windows 7 or later
* No additional software needed
* Everything is included!

Using the Application:

Starting the App:
* Double-click Start_LightERP.bat
* Wait for browser to open automatically
* Or visit http://localhost:8005 manually

Accessing the App:
* Once started visit http://localhost:8005
* Bookmark this page for easy access

Stopping the App:
* Close the command window
* Or press Ctrl+C in the window

Features:

User Authentication
* Secure login system
* Three user roles: Admin, Manager, Cashier
* Password encryption
* Role-based menu access

Dashboard
* View business overview
* See sales, inventory, and financial summaries
* Different views based on user role

Inventory - Manager and Admin only
* Add edit delete products
* Track stock levels
* Low stock alerts
* Barcode generation

POS - Point of Sale - All users
* Select sales user for each transaction
* Quick sales processing
* Multiple payment methods
* Automatic inventory updates
* Receipt generation

Expenses - Manager and Admin only
* Record business expenses
* Categorize by type
* Track vendors and receipts
* Automatic ledger integration

Sales Users - Manager and Admin only
* Manage sales staff
* Track employee codes
* Active and inactive status
* Performance tracking

Ledger - Manager and Admin only
* View all financial transactions
* Automatic balance tracking

Reports - Manager and Admin only
* Sales reports
* Inventory valuation
* Financial summaries

Sales User Report - Manager and Admin only
* Staff performance tracking
* Transactions, pieces sold, revenue per user
* Product breakdown by staff
* Rankings with medals for top performers

Data Storage:
Your data is stored in light_erp.db
* Backup this file to save your data
* Copy it to transfer to another computer

Troubleshooting:

Cannot login or Forgot password:
* Try default credentials admin/admin123, manager/manager123, cashier/cashier123
* Delete light_erp.db and restart to reset database
* Run python init_database.py to recreate users

Cannot see certain menu items:
* Check your user role shown under username
* Cashiers only see Dashboard and POS
* Managers see most features
* Only Admins can manage authentication users

Application will not start:
* Make sure no other application is using port 8005
* Try restarting your computer

Browser does not open:
* Manually visit http://localhost:8005
* Make sure your default browser is set

Lost data:
* Check if light_erp.db file exists
* Restore from backup if available

Support:
Refer to the main README.md file for more help

Light ERP Module v1.0.0 Portable Edition
'@

Set-Content -Path (Join-Path $packageDir "README.txt") -Value $userReadme

# Create a simple batch file launcher as backup
$batchLauncher = @'
@echo off
title Light ERP Module
echo Starting Light ERP Module...
echo.
echo The application will open in your web browser
echo at http://localhost:8005
echo.
echo Press Ctrl+C to stop the server
echo.
start http://localhost:8005
LightERP.exe
pause
'@

Set-Content -Path (Join-Path $packageDir "Start_LightERP.bat") -Value $batchLauncher

Write-Host "Distribution package created" -ForegroundColor Green

# Step 5: Create ZIP archive
Write-Host ""
Write-Host "Step 5: Creating ZIP Archive..." -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray

Set-Location $distDir
$zipName = "LightERP_Portable_v1.0.0.zip"
Write-Host "Creating $zipName..." -ForegroundColor Yellow

if (Get-Command Compress-Archive -ErrorAction SilentlyContinue) {
    Compress-Archive -Path "LightERP" -DestinationPath $zipName -Force
    Write-Host "ZIP archive created" -ForegroundColor Green
} else {
    Write-Host "Compress-Archive not available, skipping ZIP creation" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Build Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Distribution package location:" -ForegroundColor White
Write-Host "  $packageDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files included:" -ForegroundColor White
Write-Host "  Start_LightERP.bat (Double-click this to start)" -ForegroundColor Green
Write-Host "  LightERP.exe (Main application)" -ForegroundColor Green
Write-Host "  Frontend files (UI)" -ForegroundColor Green
Write-Host "  init_database.py (Setup script)" -ForegroundColor Green
Write-Host "  add_sample_data.py (Sample data script)" -ForegroundColor Green
Write-Host "  README.txt (User guide)" -ForegroundColor Green
Write-Host ""

if (Test-Path (Join-Path $distDir $zipName)) {
    Write-Host "ZIP archive created:" -ForegroundColor White
    Write-Host "  $(Join-Path $distDir $zipName)" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "To distribute:" -ForegroundColor Yellow
Write-Host "  1. Share the LightERP folder or ZIP file" -ForegroundColor White
Write-Host "  2. Users just double-click Start_LightERP.bat" -ForegroundColor White
Write-Host "  3. No installation required" -ForegroundColor White
Write-Host ""

Set-Location $scriptDir
