<#
Starts the Light backend module.

Usage: Run this from a PowerShell prompt in the repository root:
    .\start_light_backend.ps1

It will:
 - change directory to .\light\backend\
 - activate the virtual environment at .\venv\Scripts\Activate.ps1
 - run `python main.py`
#>

Set-StrictMode -Version Latest

try {
    Push-Location -Path "$PSScriptRoot"
} catch {
    # If script executed from elsewhere, still continue relative to current location
}

if (Test-Path -Path ".\light\backend\") {
    Set-Location -Path ".\light\backend\"
} else {
    Write-Error "Directory .\light\backend\ not found. Run this from the repository root."
    exit 1
}

$activate = Join-Path -Path $PWD -ChildPath "venv\Scripts\Activate.ps1"
if (Test-Path -Path $activate) {
    Write-Host "Activating virtual environment: $activate"
    # dot-source the activation script so it affects this session
    . $activate
} else {
    Write-Warning "Virtualenv activation script not found at $activate. Continuing without activation."
}

Write-Host "Starting Light backend (python main.py) in: $PWD"
try {
    python main.py
} catch {
    Write-Error "Failed to start backend: $_"
    exit 1
}

Pop-Location -ErrorAction SilentlyContinue
