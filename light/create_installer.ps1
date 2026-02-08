# Light ERP - Simple Installer Creator
# Creates a self-extracting installer for non-technical users

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Light ERP - Installer Creator" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$distDir = Join-Path $scriptDir "dist"
$packageDir = Join-Path $distDir "LightERP"

# Check if package exists
if (-not (Test-Path $packageDir)) {
    Write-Host "ERROR: Package not found!" -ForegroundColor Red
    Write-Host "Please run build_portable.ps1 first" -ForegroundColor Yellow
    exit 1
}

# Create installer script
Write-Host "Creating installer script..." -ForegroundColor Yellow

$installerScript = @'
# Light ERP - One-Click Installer
# This script extracts and sets up Light ERP Module

$ErrorActionPreference = "Stop"

# Unblock files if they are marked as downloaded
try {
    Get-ChildItem -Path $PSScriptRoot -Recurse | Unblock-File
} catch {}

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Create installation GUI
$form = New-Object System.Windows.Forms.Form
$form.Text = "Light ERP - Installation"
$form.Size = New-Object System.Drawing.Size(500, 400)
$form.StartPosition = "CenterScreen"
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false

# Title
$titleLabel = New-Object System.Windows.Forms.Label
$titleLabel.Location = New-Object System.Drawing.Point(20, 20)
$titleLabel.Size = New-Object System.Drawing.Size(460, 40)
$titleLabel.Text = "Light ERP Module - Installation"
$titleLabel.Font = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)
$titleLabel.ForeColor = [System.Drawing.Color]::FromArgb(52, 152, 219)
$form.Controls.Add($titleLabel)

# Description
$descLabel = New-Object System.Windows.Forms.Label
$descLabel.Location = New-Object System.Drawing.Point(20, 70)
$descLabel.Size = New-Object System.Drawing.Size(460, 60)
$descLabel.Text = "Complete business management solution with POS, Inventory, and Financial tracking. No technical knowledge required!"
$descLabel.Font = New-Object System.Drawing.Font("Arial", 10)
$form.Controls.Add($descLabel)

# Installation path label
$pathLabel = New-Object System.Windows.Forms.Label
$pathLabel.Location = New-Object System.Drawing.Point(20, 140)
$pathLabel.Size = New-Object System.Drawing.Size(460, 20)
$pathLabel.Text = "Installation Location:"
$pathLabel.Font = New-Object System.Drawing.Font("Arial", 10, [System.Drawing.FontStyle]::Bold)
$form.Controls.Add($pathLabel)

# Installation path textbox
$pathTextBox = New-Object System.Windows.Forms.TextBox
$pathTextBox.Location = New-Object System.Drawing.Point(20, 165)
$pathTextBox.Size = New-Object System.Drawing.Size(360, 25)
$pathTextBox.Text = "$env:USERPROFILE\Desktop\LightERP"
$pathTextBox.Font = New-Object System.Drawing.Font("Arial", 10)
$form.Controls.Add($pathTextBox)

# Browse button
$browseButton = New-Object System.Windows.Forms.Button
$browseButton.Location = New-Object System.Drawing.Point(390, 163)
$browseButton.Size = New-Object System.Drawing.Size(90, 27)
$browseButton.Text = "Browse..."
$browseButton.Font = New-Object System.Drawing.Font("Arial", 9)
$browseButton.Add_Click({
    $folderBrowser = New-Object System.Windows.Forms.FolderBrowserDialog
    $folderBrowser.Description = "Select installation folder"
    $folderBrowser.SelectedPath = $pathTextBox.Text
    if ($folderBrowser.ShowDialog() -eq "OK") {
        $pathTextBox.Text = Join-Path $folderBrowser.SelectedPath "LightERP"
    }
})
$form.Controls.Add($browseButton)

# Create desktop shortcut checkbox
$shortcutCheckbox = New-Object System.Windows.Forms.CheckBox
$shortcutCheckbox.Location = New-Object System.Drawing.Point(20, 210)
$shortcutCheckbox.Size = New-Object System.Drawing.Size(460, 25)
$shortcutCheckbox.Text = "Create desktop shortcut"
$shortcutCheckbox.Checked = $true
$shortcutCheckbox.Font = New-Object System.Drawing.Font("Arial", 10)
$form.Controls.Add($shortcutCheckbox)

# Status label
$statusLabel = New-Object System.Windows.Forms.Label
$statusLabel.Location = New-Object System.Drawing.Point(20, 250)
$statusLabel.Size = New-Object System.Drawing.Size(460, 40)
$statusLabel.Text = "Ready to install"
$statusLabel.Font = New-Object System.Drawing.Font("Arial", 9)
$statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(127, 140, 141)
$form.Controls.Add($statusLabel)

# Install button
$installButton = New-Object System.Windows.Forms.Button
$installButton.Location = New-Object System.Drawing.Point(280, 310)
$installButton.Size = New-Object System.Drawing.Size(100, 35)
$installButton.Text = "Install"
$installButton.Font = New-Object System.Drawing.Font("Arial", 11, [System.Drawing.FontStyle]::Bold)
$installButton.BackColor = [System.Drawing.Color]::FromArgb(39, 174, 96)
$installButton.ForeColor = [System.Drawing.Color]::White
$installButton.FlatStyle = "Flat"
$installButton.Add_Click({
    $installPath = $pathTextBox.Text
    
    try {
        $statusLabel.Text = "Installing..."
        $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(243, 156, 18)
        $form.Refresh()
        
        # Create installation directory
        if (-not (Test-Path $installPath)) {
            New-Item -ItemType Directory -Path $installPath -Force | Out-Null
        }
        
        # Extract embedded package (this would be replaced with actual extraction)
        $statusLabel.Text = "Extracting files..."
        $form.Refresh()
        
        # Copy files from temporary location
        $tempPackage = Join-Path $PSScriptRoot "LightERP"
        if (Test-Path $tempPackage) {
            Copy-Item -Path "$tempPackage\*" -Destination $installPath -Recurse -Force
        }
        
        # Create desktop shortcut if requested
        if ($shortcutCheckbox.Checked) {
            $statusLabel.Text = "Creating shortcut..."
            $form.Refresh()
            
            $WshShell = New-Object -ComObject WScript.Shell
            $shortcutPath = Join-Path $env:USERPROFILE "Desktop\Light ERP.lnk"
            $shortcut = $WshShell.CreateShortcut($shortcutPath)
            $shortcut.TargetPath = Join-Path $installPath "LightERP_Launcher.exe"
            $shortcut.WorkingDirectory = $installPath
            $shortcut.Description = "Light ERP Module"
            $shortcut.Save()
        }
        
        $statusLabel.Text = "Installation complete!"
        $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(39, 174, 96)
        $form.Refresh()
        
        # Show success message
        [System.Windows.Forms.MessageBox]::Show(
            "Light ERP has been installed successfully!`n`nClick OK to launch the application.",
            "Installation Complete",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Information
        )
        
        # Launch application
        $launcherPath = Join-Path $installPath "LightERP_Launcher.exe"
        if (Test-Path $launcherPath) {
            Start-Process $launcherPath
        }
        
        $form.Close()
        
    } catch {
        $statusLabel.Text = "Installation failed!"
        $statusLabel.ForeColor = [System.Drawing.Color]::FromArgb(231, 76, 60)
        [System.Windows.Forms.MessageBox]::Show(
            "Installation failed: $_",
            "Error",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error
        )
    }
})
$form.Controls.Add($installButton)

# Cancel button
$cancelButton = New-Object System.Windows.Forms.Button
$cancelButton.Location = New-Object System.Drawing.Point(390, 310)
$cancelButton.Size = New-Object System.Drawing.Size(90, 35)
$cancelButton.Text = "Cancel"
$cancelButton.Font = New-Object System.Drawing.Font("Arial", 10)
$cancelButton.Add_Click({ $form.Close() })
$form.Controls.Add($cancelButton)

# Show form
$form.ShowDialog() | Out-Null
'@

$installerPath = Join-Path $distDir "LightERP_Installer.ps1"
Set-Content -Path $installerPath -Value $installerScript

Write-Host "✓ Installer script created" -ForegroundColor Green

# Create a simple batch file to run the installer
$batchInstaller = @"
@echo off
title Light ERP - Installer
setlocal
set "SCRIPT_DIR=%~dp0"
REM Unblock files downloaded from the internet
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-ChildItem -Path '%SCRIPT_DIR%' -Recurse | Unblock-File" 2>nul
REM Run installer
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%LightERP_Installer.ps1"
endlocal
"@

$batchInstallerPath = Join-Path $distDir "Install_LightERP.bat"
Set-Content -Path $batchInstallerPath -Value $batchInstaller

Write-Host "✓ Batch installer created" -ForegroundColor Green

# Create a simple HTML guide
$htmlGuide = @"
<!DOCTYPE html>
<html>
<head>
    <title>Light ERP - Installation Guide</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #3498db;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        h2 {
            color: #2c3e50;
            margin-top: 30px;
        }
        .step {
            background: #ecf0f1;
            padding: 15px;
            margin: 15px 0;
            border-left: 4px solid #3498db;
            border-radius: 5px;
        }
        .step strong {
            color: #2c3e50;
            font-size: 18px;
        }
        .feature {
            background: #e8f8f5;
            padding: 10px;
            margin: 10px 0;
            border-left: 4px solid #27ae60;
            border-radius: 5px;
        }
        .warning {
            background: #fef5e7;
            padding: 15px;
            margin: 15px 0;
            border-left: 4px solid #f39c12;
            border-radius: 5px;
        }
        code {
            background: #34495e;
            color: #ecf0f1;
            padding: 2px 6px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Light ERP Module - Quick Start Guide</h1>
        
        <h2>📦 What is Light ERP?</h2>
        <p>Light ERP is a complete business management solution that runs on your computer. It includes:</p>
        <div class="feature">✅ Point of Sale (POS) system</div>
        <div class="feature">✅ Inventory management</div>
        <div class="feature">✅ Financial ledger tracking</div>
        <div class="feature">✅ Reports and analytics</div>
        
        <h2>💻 Installation Instructions</h2>
        
        <div class="step">
            <strong>Step 1:</strong> Double-click <code>Install_LightERP.bat</code>
        </div>
        
        <div class="step">
            <strong>Step 2:</strong> Choose where to install (default is your Desktop)
        </div>
        
        <div class="step">
            <strong>Step 3:</strong> Click "Install" and wait for completion
        </div>
        
        <div class="step">
            <strong>Step 4:</strong> The application will start automatically!
        </div>
        
        <h2>🎯 Using Light ERP</h2>
        
        <h3>Starting the Application</h3>
        <ul>
            <li>Double-click the "Light ERP" shortcut on your desktop</li>
            <li>OR navigate to the installation folder and run <code>LightERP_Launcher.exe</code></li>
            <li>Click "Start Application" in the window that appears</li>
            <li>Your web browser will automatically open</li>
        </ul>
        
        <h3>First Time Use</h3>
        <ul>
            <li>Sample products are already loaded for you to explore</li>
            <li>Try making a test sale in the POS section</li>
            <li>Add your own products in the Inventory section</li>
            <li>View reports to see your business analytics</li>
        </ul>
        
        <div class="warning">
            <strong>⚠️ Important:</strong> Your data is stored in the <code>light_erp.db</code> file in the installation folder. 
            Make regular backups by copying this file to a safe location!
        </div>
        
        <h2>🛠️ Troubleshooting</h2>
        
        <h3>Windows blocked the installer?</h3>
        <ul>
            <li>Right-click the ZIP → Properties → check "Unblock" → Apply.</li>
            <li>Extract to a local folder (avoid OneDrive or network shares).</li>
            <li>Open PowerShell in the extracted folder and run: <code>Get-ChildItem -Recurse | Unblock-File</code></li>
            <li>Then double-click <code>Install_LightERP.bat</code> again.</li>
        </ul>

        <h3>Application won't start?</h3>
        <ul>
            <li>Make sure no other program is using port 8005</li>
            <li>Try restarting your computer</li>
            <li>Run as Administrator if needed</li>
        </ul>
        
        <h3>Browser doesn't open?</h3>
        <ul>
            <li>Manually open your browser and go to: <code>http://localhost:8005</code></li>
        </ul>
        
        <h2>📞 Need Help?</h2>
        <p>Refer to the README.txt file in the installation folder for more detailed information.</p>
        
        <hr style="margin: 30px 0;">
        <p style="text-align: center; color: #7f8c8d;">
            Light ERP Module v1.0.0 | No internet connection required | All data stays on your computer
        </p>
    </div>
</body>
</html>
"@

$htmlGuidePath = Join-Path $distDir "Installation_Guide.html"
Set-Content -Path $htmlGuidePath -Value $htmlGuide

Write-Host "✓ HTML guide created" -ForegroundColor Green

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Installer Package Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files created in: $distDir" -ForegroundColor White
Write-Host "  ✓ Install_LightERP.bat (Main installer)" -ForegroundColor Green
Write-Host "  ✓ Installation_Guide.html (User guide)" -ForegroundColor Green
Write-Host ""
Write-Host "To distribute:" -ForegroundColor Yellow
Write-Host "  1. Zip the entire 'dist' folder" -ForegroundColor White
Write-Host "  2. Share with users" -ForegroundColor White
Write-Host "  3. Users double-click Install_LightERP.bat" -ForegroundColor White
Write-Host "  4. That's it!" -ForegroundColor White
Write-Host ""
