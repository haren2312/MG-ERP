# Light ERP Module - PowerShell Startup Script
# This script starts both the backend and frontend servers

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Light ERP Module - Starting..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $scriptDir "backend"
$frontendDir = Join-Path $scriptDir "frontend"

# Function to check if a command exists
function Test-Command {
    param($Command)
    try {
        if (Get-Command $Command -ErrorAction Stop) {
            return $true
        }
    }
    catch {
        return $false
    }
}

# Check Python
Write-Host "Checking Python installation..." -ForegroundColor Yellow
if (-not (Test-Command "python")) {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.11 or higher from https://www.python.org/" -ForegroundColor Red
    exit 1
}

$pythonVersion = python --version
Write-Host "✓ Found: $pythonVersion" -ForegroundColor Green

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
if (-not (Test-Command "node")) {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

$nodeVersion = node --version
Write-Host "✓ Found Node.js: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Start Backend
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Starting Backend Server..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

if (-not (Test-Path $backendDir)) {
    Write-Host "ERROR: Backend directory not found at $backendDir" -ForegroundColor Red
    exit 1
}

Set-Location $backendDir

# Check if virtual environment exists
if (Test-Path "venv") {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & ".\venv\Scripts\Activate.ps1"
}

# Check if requirements are installed
Write-Host "Checking Python dependencies..." -ForegroundColor Yellow
$pipList = pip list 2>$null
if ($pipList -notmatch "fastapi") {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

# Initialize database if it doesn't exist
if (-not (Test-Path "light_erp.db")) {
    Write-Host "Initializing database with sample data..." -ForegroundColor Yellow
    python add_sample_data.py
}

Write-Host "Starting backend server on http://localhost:8005" -ForegroundColor Green
Write-Host "API Documentation: http://localhost:8005/docs" -ForegroundColor Green
Write-Host ""

# Start backend in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; if (Test-Path 'venv') { & '.\venv\Scripts\Activate.ps1' }; python main.py"

# Wait for backend to start
Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Starting Frontend Server..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

Set-Location $frontendDir

if (-not (Test-Path $frontendDir)) {
    Write-Host "ERROR: Frontend directory not found at $frontendDir" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Starting frontend server on http://localhost:5173" -ForegroundColor Green
Write-Host ""

# Start frontend in a new PowerShell window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "  Light ERP Module Started!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend API:      http://localhost:8005" -ForegroundColor Cyan
Write-Host "API Docs:         http://localhost:8005/docs" -ForegroundColor Cyan
Write-Host "Frontend:         http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop the servers" -ForegroundColor Yellow
Write-Host ""

# Return to original directory
Set-Location $scriptDir
